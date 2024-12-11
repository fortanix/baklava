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


//
// Commands
//

/*
Takes CSS variables of the form `--<var-name>: <expr>;` (as exported from Figma) and converts it to Sass variables. We
expect the same variable to be in the input exactly twice, the first is assumed to be the light mode variant, the
second dark.

Usage:
- Run `tsx scripts/import.ts parse-tokens`
  > or, with files: `cat input.txt | tsx scripts/import.ts parse-tokens > output.txt`
- Paste the variables input, with light variables first, then dark.
- Press CTRL+D to end the input stream.
- Copy the output into `src/styling/variables.scss`
*/
const runParseTokens = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  type Token = { light: string, dark?: undefined | string };
  type Tokens = Record<string, Token>;
  let tokens: Tokens = {};
  for await (const line of createInterface({ input: process.stdin })) {
    if (line.trim() === '') { continue; }
    
    const matches = line.trim().match(/^--([a-z0-9-]+):\s*(.+)\s*;$/);
    if (!matches) {
      throw new Error(`Invalid token input:\n${line}\n`);
    }
    const [_match, tokenName, tokenValue] = matches;
    if (tokenName === undefined || tokenValue === undefined) { throw new Error(`Should not happen`); }
    
    if (tokens[tokenName]) {
      tokens[tokenName].dark = tokenValue;
    } else {
      tokens[tokenName] = { light: tokenValue };
    }
  }
  
  const parseExpr = (expr: string) => {
    // Replace color variables with their Sass equivalent
    return expr.replaceAll(/var\(--([a-z0-9-]+-\d{1,4})\)/g, '$$color-$1');
  };
  
  const outputLight = [];
  const outputDark = [];
  const outputTheme = [];
  for (const [tokenName, token] of Object.entries(tokens)) {
    if (typeof token.dark === 'undefined') {
      throw new Error(`Missing dark variable for '${tokenName}'`);
    }
    
    outputLight.push(`$light-${tokenName}: ${parseExpr(token.light)} !default;`);
    outputDark.push(`$dark-${tokenName}: ${parseExpr(token.dark)} !default;`);
    outputTheme.push(`$theme-${tokenName}: #{ld($light-${tokenName}, $dark-${tokenName})} !default;`);
  }
  
  logger.log(dedent`
    // Light theme
    ${outputLight.join('\n')}
    
    // Dark theme
    ${outputDark.join('\n')}
    
    // Dynamic theme
    ${outputTheme.join('\n')}
  `);
};

const runCreateIconsManifest = async (args: ScriptArgs) => {
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
  `;
  
  const manifestPath = path.join(pathIconsSource, '_icons.ts');
  logger.info(`Writing file: ${manifestPath}`);
  await fs.writeFile(manifestPath, manifest, { encoding: 'utf-8' });
};

const runImportIcons = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const isDryRun = args.values['dry-run'] ?? false;
  
  const kebabCase = (string: string) => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  
  const skippedIcons: Array<string> = [
    'ai-guardrails', // Same as "send"?
    'cross-large',
    'cross-small',
  ];
  const renamedIcons: Record<string, string> = {
    'integrations': 'integration',
    'zctivity': 'activity',
    'hallucination-policy': 'hallucination',
    'status-cancel': 'status-cancelled',
    'cross-medium': 'cross',
  };
  
  const pathIconsSource = path.join(process.cwd(), './src/assets/icons_source');
  const pathIconsTarget = path.join(process.cwd(), './src/assets/icons');
  
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
    logger.log(`Copying '${rel(pathSource)}' to '${rel(pathTarget)}'`);
    if (!isDryRun) {
      await fs.copyFile(pathSource, pathTarget);
    }
  }
  
  // Create `_icons.ts` manifest file
  logger.log(`Creating '_icons.ts' manifest file.`);
  if (!isDryRun) {
    await runCreateIconsManifest(args);
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
      - parse-tokens
      - import-icons
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
      case 'parse-tokens': await runParseTokens(argsForCommand); break;
      case 'import-icons': await runImportIcons(argsForCommand); break;
      case 'icons-manifest': await runCreateIconsManifest(argsForCommand); break;
      default:
        logger.error(`Unknown command '${command}'\n`);
        printUsage();
        break;
    }
  });
};

// Detect if this module is being run directly from the command line
const [_argExec, argScript, ...args] = process.argv; // First two arguments should be the executable + script
if (argScript && await fs.realpath(argScript) === fileURLToPath(import.meta.url)) {
  try {
    await run(args);
    process.exit(0);
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
}
