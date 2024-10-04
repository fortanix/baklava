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
    help: boolean | undefined,
    silent: boolean | undefined,
  },
  positionals: Array<string>,
};


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
  
  const pathIcons = path.join(process.cwd(), './src/assets/icons');
  
  const files = await fs.readdir(pathIcons);
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
  
  const manifestPath = path.join(pathIcons, '_icons.ts');
  logger.info(`Writing file: ${manifestPath}`)
  await fs.writeFile(manifestPath, manifest, { encoding: 'utf-8' });
};

const runImportIcons = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const kebabCase = (string: string) => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  
  const remove: Array<string> = [
    // Remove other company/project icons
    'apache',
  ];
  const rename: Record<string, string> = {
    'ki': 'fortanix-ki',
    'security-objects': 'security-object',
    'carrot-down': 'caret-down', // Typo
    'page-fwd': 'page-forward',
    'user-account': 'user-profile', // "User account" is a misleading term considering our information architecture
    'users': 'user',
    // NOTE: missing `account` icon
  };
  
  const pathIcons = path.join(process.cwd(), './src/assets/icons_new');
  const pathIconsOut = path.join(process.cwd(), './src/assets/icons');
  
  // Delete existing icons
  for (const file of await fs.readdir(pathIconsOut)) {
    await fs.unlink(path.join(pathIconsOut, file));
  }
  
  const files = await fs.readdir(pathIcons);
  for (const fileName of files) {
    const fileNameKebab = kebabCase(fileName.replace(/\.svg$/, ''));
    const iconName = ((): string => {
      if (Object.hasOwn(rename, fileNameKebab) && rename[fileNameKebab]) {
        return rename[fileNameKebab];
      } else {
        return fileNameKebab;
      }
    })();
    
    if (iconName in remove) {
      continue;
    }
    
    const pathSource = path.join(pathIcons, fileName);
    const pathTarget = path.join(pathIconsOut, `${iconName}.svg`)
    logger.log(`Copying '${pathSource}' to '${pathTarget}'`);
    await fs.copyFile(pathSource, pathTarget);
  }
  
  // Create `_icons.ts` manifest file
  await runCreateIconsManifest(args);
};


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
      help: { type: 'boolean', short: 'h' },
      silent: { type: 'boolean' },
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
