#!/usr/bin/env tsx

/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Importer utlity for assets exported from Figma */

import { dedent } from 'ts-dedent';
import { parseArgs } from 'node:util';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import * as fs from 'node:fs/promises';
import { AsyncLocalStorage } from 'node:async_hooks';


//
// Setup
//

type Logger = Pick<Console, 'info' | 'error' | 'log'>;
type Services = { logger: Logger };
const servicesStorage = new AsyncLocalStorage<Services>();
const getServices = () => {
  const services = servicesStorage.getStore();
  if (typeof services === 'undefined') { throw new Error(`Missing services`); }
  return services;
};

type ScriptArgs = {
  values: {
    'help'?: undefined | boolean,
    'silent'?: undefined | boolean,
    'dry-run'?: undefined | boolean,
  },
  positionals: Array<string>,
};


//
// Common
//

// Return a relative path to the given absolute path, relative to the current CWD
const rel = (absolutePath: string): string => {
  return path.relative(process.cwd(), absolutePath);
};

const addGenerationComment = (fileContents: string) => dedent`
  /* GENERATED OUTPUT */
  /* Do not modify, use \`npm run import\` instead. */
  
  ${fileContents}
  ` + '\n';


//
// Token parsing
//

type TokenName = string;
type Tokens<T> = Record<TokenName, T>;

// Read a list of tokens from the given stream. There should be one token per line, the format of each should be:
//   --<token-name>: <value>;
// We continue to read either until the stream ends, or if we encounter a line of the form `---`.
const readTokensFromStream = async <T>(
  stream: AsyncIterable<string>,
  parseToken: (tokenName: TokenName, tokenValue: string, prefix: null | string) => T,
  prefixes: Array<null | string> = [null],
): Promise<Tokens<T>> => {
  let prefixIndex = 0;
  
  const tokensIn: Tokens<T> = {};
  for await (const line of stream) {
    const prefix: undefined | null | string = prefixes[prefixIndex];
    if (typeof prefix === 'undefined') { break; }
    
    if (line.trim() === '') { continue; }
    if (line.trim() === '---') { prefixIndex++; continue; } // Jump to the next prefix (if any)
    
    const matches = line.trim().match(/^--([a-z0-9-]+):\s*(.+)\s*;$/);
    if (!matches) { throw new Error(`Invalid token input:\n${line}\n`); }
    
    const [_match, tokenName, tokenValue] = matches;
    if (tokenName === undefined || tokenValue === undefined) { throw new Error(`Should not happen`); }
    if (tokensIn[tokenName]) { throw new Error(`Duplicate token found: ${tokenName}`); }
    
    const tokenNameWithPrefix = typeof prefix === 'string' ? `${prefix}-${tokenName}` : tokenName;
    
    try {
      tokensIn[tokenNameWithPrefix] = parseToken(tokenNameWithPrefix, tokenValue, prefix);
    } catch (error: unknown) {
      throw new Error(`Invalid token input:\n${line}\n`, { cause: error });
    }
  }
  
  // Sort keys
  const tokenNamesSorted: Array<TokenName> = Object.keys(tokensIn).sort((tokenName1, tokenName2) => {
    const segments1 = tokenName1.split('-');
    const segments2 = tokenName2.split('-');
    
    for (let i = 0; i < segments1.length; i++) {
      const segment1 = segments1[i] as string; // Safe, since we're assuming the array has no gaps
      const segment2: undefined | string = segments2[i];
      
      if (typeof segment2 === 'undefined') { return +1; }
      if (segment1 === segment2) { continue; }
      if (/^\d+$/.test(segment1) && /^\d+$/.test(segment2)) { // Special case: comparing two numbers
        return parseInt(segment1) - parseInt(segment2);
      }
      return segment1.localeCompare(segment2);
    }
    return 0; // Equal
  });
  
  const tokens = tokenNamesSorted.reduce<Tokens<T>>((tokens, tokenName) => {
    const token = tokensIn[tokenName];
    if (typeof token === 'undefined') { throw new Error(`Should not happen`); }
    tokens[tokenName] = token;
    return tokens;
  }, {});
  
  return tokens;
};


//
// Commands
//

/*
Takes primitive CSS color tokens of the form `--<var-name>: <expr>;` (as exported from Figma) and converts it to Sass
variables.

Usage:
- Run `npm run -- import import-colors-primitive`.
- Paste the CSS tokens exported from Figma.
- Press CTRL+D to end the input stream.
- Or, with files: `cat input.txt | npm run -- import import-colors-primitive`
*/
const runImportColorsPrimitive = async (args: ScriptArgs) => {
  const { logger } = getServices();
  const isDryRun = args.values['dry-run'] ?? false;
  
  const pathOutputSass = fileURLToPath(new URL('../src/styling/generated/colors_primitive.scss', import.meta.url));
  const pathOutputTs = fileURLToPath(new URL('../src/styling/generated/colors_primitive.ts', import.meta.url));
  
  type PrimitiveColor = { category: string, weight: number, color: string };
  const parseToken = (tokenName: TokenName, tokenValue: string): PrimitiveColor => {
    const matches = tokenName.match(/^(.+)-(\d+)$/);
    if (!matches) { throw new Error(`Invalid token name, expected: <category>-<weight>`); }
    
    const [_match, category, weight] = matches;
    if (!category || !weight) { throw new Error(`Should not happen`); }
    
    return { category, weight: parseInt(weight), color: tokenValue };
  };
  
  // Read tokens from stdin
  logger.log(`Please paste in the CSS tokens from Figma, then press CTRL+D to mark the end of the input`);
  logger.log(`Expected format: --<token-name>: <value>;\n`);
  const tokens = await readTokensFromStream(createInterface({ input: process.stdin }), parseToken);
  
  const generatedSass = Object.entries(tokens)
    .map(([tokenName, { color }]) => `$color-${tokenName}: ${color} !default;`)
    .join('\n');
  
  const generatedTs = dedent`
    export type TokenName = string;
    export type ColorPrimitive = { category: string, weight: number, color: string };
    export type ColorPrimitiveList = Record<TokenName, ColorPrimitive>;
    export const colorsPrimitive: ColorPrimitiveList = {
      ${Object.entries(tokens)
        .map(([tokenName, value]) => `${JSON.stringify(tokenName)}: ${JSON.stringify(value)},`)
        .join('\n')
      }
    };` + '\n';
  
  logger.log(`Writing generated Sass to: ${rel(pathOutputSass)}`);
  if (isDryRun) {
    logger.log(generatedSass);
  } else {
    await fs.writeFile(pathOutputSass, addGenerationComment(generatedSass), 'utf-8');
  }
  
  logger.log(`Writing generated TypeScript to: ${rel(pathOutputTs)}`);
  if (isDryRun) {
    logger.log(generatedTs);
  } else {
    await fs.writeFile(pathOutputTs, addGenerationComment(generatedTs), 'utf-8');
  }
};

/*
Takes CSS variables of the form `--<var-name>: <expr>;` (as exported from Figma) and converts it to Sass variables. We
expect the same variable to be in the input exactly twice, the first is assumed to be the light mode variant, the
second dark.

Usage:
- Run `npm run -- import import-colors-primitive`
  > or, with files: `cat input.txt | npm run -- import import-colors-primitive`
- Paste the variables input, with light variables first, then a '---' line as separator, then the dark variables.
- Press CTRL+D to end the input stream.
*/
const runImportColorsSemantic = async (args: ScriptArgs) => {
  const { logger } = getServices();
  const isDryRun = args.values['dry-run'] ?? false;
  
  const pathOutputSass = fileURLToPath(new URL('../src/styling/generated/colors_semantic.scss', import.meta.url));
  const pathOutputTs = fileURLToPath(new URL('../src/styling/generated/colors_semantic.ts', import.meta.url));
  
  type SemanticColor = { theme: 'light' | 'dark', name: string, color: string };
  const parseToken = (tokenName: TokenName, tokenValue: string, prefix: null | string): SemanticColor => {
    if (typeof prefix !== 'string' || (prefix !== 'light' && prefix !== 'dark')) {
      throw new Error(`Should not happen`);
    }
    
    if (tokenValue.match(/#[a-z0-9]{3,6}/i)) {
      throw new Error(`Found semantic color token defined using a hardcoded hex color: '${tokenName}'`);
    }
    
    // Replace references to primitive color tokens with their Sass variable equivalent
    const color = tokenValue.replaceAll(/var\(--(.+?)-(\d+)\)/g, '\$color-$1-$2');
    
    return { theme: prefix, name: tokenName.replace(`${prefix}-`, ''), color };
  };
  
  const stdin = createInterface({ input: process.stdin });
  
  // Read light theme tokens from stdin
  logger.log(`Please paste in the light theme color tokens, followed by a '---' separator line, followed by`);
  logger.log(`the dark theme color tokens. There should be a 1:1 mapping between light and dark tokens.`);
  logger.log(`Expected format:`);
  logger.log(`  --<token-name>: <light-color>;`);
  logger.log(`  ---`);
  logger.log(`  --<token-name>: <dark-color>;`);
  logger.log('');
  const tokens = await readTokensFromStream(stdin, parseToken, ['light', 'dark']);
  
  const tokensByTheme = Object.groupBy(Object.values(tokens), token => token.theme) as {
    light: Array<SemanticColor>,
    dark: Array<SemanticColor>,
  };
  
  // Check that there are no missing pairs
  const tokensLight = new Set(tokensByTheme.light.map(token => token.name));
  const tokensDark = new Set(tokensByTheme.dark.map(token => token.name));
  const tokensDiff = tokensLight.symmetricDifference(tokensDark);
  if (tokensDiff.size !== 0) {
    const diffNames = Array.from(tokensDiff.values()).join(', ');
    throw new Error(`Found tokens which are missing a corresponding light/theme opposite: ${diffNames}`);
  }
  
  const generatedSass = dedent`
    @use './colors_primitive.scss' as *;
    
    @function ld($light-color, $dark-color) {
      @return #{light-dark($light-color, $dark-color)};
    }
    
    // Light theme
    ${tokensByTheme.light
      .map(({ theme, name, color }) => `$${theme}-${name}: ${color} !default;`)
      .join('\n')
    }
    
    // Dark theme
    ${tokensByTheme.dark
      .map(({ theme, name, color }) => `$${theme}-${name}: ${color} !default;`)
      .join('\n')
    }
    
    // Dynamic theme
    ${tokensByTheme.light
      .map(({ name }) => `$theme-${name}: #{ld($light-${name}, $dark-${name})} !default;`)
      .join('\n')
    }
    
    // FIXME: missing in Figma
    $light-segmented-control-background-default: $color-neutral-0 !default;
    $dark-segmented-control-background-default: $color-blackberry-600 !default;
    $theme-segmented-control-background-default: #{ld($light-segmented-control-background-default, $dark-segmented-control-background-default)} !default;
    
    $light-segmented-control-text-unselected-2: $color-neutral-70 !default;
    $dark-segmented-control-text-unselected-2: $color-neutral-200 !default;
    $theme-segmented-control-text-unselected-2: #{ld($light-segmented-control-text-unselected-2, $dark-segmented-control-text-unselected-2)} !default;
    
    $light-notification-icon-default: $color-neutral-900 !default;
    $dark-notification-icon-default: $color-neutral-900 !default;
    $theme-notification-icon-default: #{ld($light-notification-icon-default, $dark-notification-icon-default)} !default;
  `;
  
  logger.log(`Writing generated Sass to: ${rel(pathOutputSass)}`);
  if (isDryRun) {
    logger.log(generatedSass);
  } else {
    await fs.writeFile(pathOutputSass, addGenerationComment(generatedSass), 'utf-8');
  }
  
  
  //
  // Generate a `.ts` version as well (for programmatic usage, e.g. generating diffs)
  //
  
  const generatedTs = dedent`
    export type TokenName = string;
    export type ColorSemantic = { color: string };
    export type ColorSemanticList = Record<TokenName, ColorSemantic>;
    
    export const colorsLight: ColorSemanticList = {
      ${tokensByTheme.light
        .map(({ name, color }) => `${JSON.stringify(name)}: { color: ${JSON.stringify(color)} },`)
        .join('\n')
      }
    };
    
    export const colorsDark: ColorSemanticList = {
      ${tokensByTheme.dark
        .map(({ name, color }) => `${JSON.stringify(name)}: { color: ${JSON.stringify(color)} },`)
        .join('\n')
      }
    };
  `;
  
  logger.log(`Writing generated TypeScript to: ${rel(pathOutputTs)}`);
  if (isDryRun) {
    logger.log(generatedTs);
  } else {
    await fs.writeFile(pathOutputTs, addGenerationComment(generatedTs), 'utf-8');
  }
};


const createIconsManifest = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const pathIconsSource = path.join(process.cwd(), './src/assets/icons');
  
  const files = await fs.readdir(pathIconsSource);
  const icons = [];
  for (const fileName of files) {
    const iconName = fileName.replace(/\.svg$/, '');
    icons.push(iconName);
  }
  
  const manifest = dedent`
    type IconDef = {};
    export const icons = {
    ${icons.map(iconName => `  '${iconName}': {},`).join('\n')}
    } as const satisfies Record<string, IconDef>;
  ` + '\n';
  
  const manifestPath = path.join(pathIconsSource, '_icons.ts');
  logger.info(`Writing file: ${manifestPath}`);
  await fs.writeFile(manifestPath, manifest, { encoding: 'utf-8' });
};

type IconValidity = { isValid: true } | { isValid: false, message: string };
const validateIcon = async (path: string): Promise<IconValidity> => {
  try {
    const iconSvg: string = (await fs.readFile(path)).toString();
    
    // Check: dimensions
    const width = iconSvg.match(/width="(\d+)"/)?.[1];
    const height = iconSvg.match(/height="(\d+)"/)?.[1];
    if (!width || !height) {
      throw new Error('Missing width/height in SVG');
    }
    if (Number.parseInt(width) !== 18 || Number.parseInt(height) !== 18) {
      throw new Error(`Expect icon dimensions to be 18x18, found ${width}x${height}`);
    }
    
    // Check: fill color
    const fillColor = iconSvg.match(/<svg[^>]+fill="currentColor"[^>]*>/);
    if (!fillColor) {
      throw new Error('Incorrect fill color');
    }
    
    // Check: monochromaticity
    const colors = iconSvg.match(/#[0-9a-f]{3,6}/i);
    if (colors) {
      throw new Error('Found hardcoded colors, expected only `currentColor`.');
    }
    
    return { isValid: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : `Unknown error (${JSON.stringify(error)})`;
    return { isValid: false, message };
  }
};

/*
Takes a directory of icons (exported from Figma) as input, and updates the icons directory in Baklava accordingly.
*/
const runImportIcons = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  // Arguments
  const pathIconsArg: undefined | string = args.positionals[0];
  const isDryRun = args.values['dry-run'] ?? false;
  
  if (!pathIconsArg) { throw new Error(`Missing argument: icons source path`); }
  
  const pathIconsSource = pathIconsArg.startsWith('/') ? pathIconsArg : path.join(process.cwd(), pathIconsArg);
  const pathIconsTarget = path.join(process.cwd(), './src/assets/icons');
  
  try {
    await fs.access(pathIconsSource);
  } catch (error: unknown) {
    throw new Error(`Could not access icons directory ${pathIconsSource}. Does it exist?`);
  }
  
  // Util: convert to kebab-case
  const kebabCase = (string: string) => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  
  const skippedIcons: Array<string> = [];
  const renamedIcons: Record<string, string> = {};
  
  // Delete existing icons
  logger.log(`Deleting existing icons in ${rel(pathIconsTarget)}`);
  if (!isDryRun) {
    for (const fileName of await fs.readdir(pathIconsTarget)) {
      await fs.unlink(path.join(pathIconsTarget, fileName));
    }
  }
  
  const files = await fs.readdir(pathIconsSource);
  for (const fileName of files) {
    if (!fileName.includes('.svg')) { continue; }
    
    const fileNameKebab = kebabCase(fileName.replace(/\.svg$/, ''));
    const iconName = ((): string => {
      if (Object.hasOwn(renamedIcons, fileNameKebab) && renamedIcons[fileNameKebab]) {
        return renamedIcons[fileNameKebab];
      } else {
        return fileNameKebab;
      }
    })();
    
    if (skippedIcons.includes(iconName)) {
      logger.log(`Skipping icon: ${iconName}`);
      continue;
    }
    
    const pathSource = path.join(pathIconsSource, fileName);
    const pathTarget = path.join(pathIconsTarget, `${iconName}.svg`)
    
    try {
      const validity = await validateIcon(pathSource);
      if (!validity.isValid) {
        throw new Error(`Found invalid icon '${iconName}': ${validity.message}`);
      }
    } catch (error) {
      console.log(error);
      continue;
    }
    
    logger.log(`Copying '${rel(pathSource)}' to '${rel(pathTarget)}'`);
    if (!isDryRun) {
      await fs.copyFile(pathSource, pathTarget);
    }
  }
  
  // Create `_icons.ts` manifest file
  logger.log(`Creating '_icons.ts' manifest file.`);
  if (!isDryRun) {
    await createIconsManifest(args);
  }
};


//
// Run
//

const printUsage = () => {
  const { logger } = getServices();
  
  logger.info(dedent`
    Usage: import.ts <cmd> <...args>
    
    Commands:
      - import-colors-primitive
      - import-colors-semantic
      - import-icons <path-to-icons>
  `);
};

// Run the script with the given CLI arguments
export const run = async (argsRaw: Array<string>): Promise<void> => {
  // Ref: https://exploringjs.com/nodejs-shell-scripting/ch_node-util-parseargs.html
  const args = parseArgs({
    args: argsRaw,
    allowPositionals: true,
    options: {
      'help': { type: 'boolean', short: 'h' },
      'silent': { type: 'boolean' },
      'dry-run': { type: 'boolean' },
    },
  });
  
  // Services
  const logger: Logger = {
    info: args.values.silent ? () => {} : console.info,
    error: console.error,
    log: console.log,
  };
  
  await servicesStorage.run({ logger }, async () => {
    const command: null | string = args.positionals[0] ?? null;
    if (command === null || args.values.help) {
      printUsage();
      return;
    }
    
    const argsForCommand: ScriptArgs = { ...args, positionals: args.positionals.slice(1) };
    switch (command) {
      case 'import-colors-primitive': await runImportColorsPrimitive(argsForCommand); break;
      case 'import-colors-semantic': await runImportColorsSemantic(argsForCommand); break;
      case 'import-icons': await runImportIcons(argsForCommand); break;
      default:
        logger.error(`Unknown command '${command}'\n`);
        printUsage();
        break;
    }
  });
};

if (!('main' in import.meta)) {
  throw new Error(`Please upgrade to Node v24.2+`);
}

// Detect if this module is being run directly from the command line
const [_argExec, _argScript, ...args] = process.argv; // First two arguments should be the executable + script
// @ts-ignore `import.meta.main` is not supported in `@types/node` currently, once v24.2 is out remove this comment
if (import.meta.main) {
  try {
    await run(args);
    process.exit(0);
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
}
