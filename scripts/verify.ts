
import { dedent } from 'ts-dedent';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs/promises';
import { exec } from 'node:child_process';
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
    help?: undefined | boolean,
    silent?: undefined | boolean,
  },
  positionals: Array<string>,
};


//
// Common
//

const getCurrentGitBranch = () => new Promise<string>((resolve, reject) => {
  return exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
    if (err) {
      reject(`Failed to determine current git branch: ${err}`);
    } else if (typeof stdout === 'string') {
      resolve(stdout.trim());
    }
  });
});

const readDistCss = async () => {
  const path = fileURLToPath(new URL('../dist/lib.css', import.meta.url));
  return (await fs.readFile(path)).toString(); // May throw
};


//
// Commands
//

export const runVerifyBuild = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const cssContent = await readDistCss();
  const cssContentStripped = cssContent.replaceAll(`@charset "UTF-8";`, '').trim();
  
  // We need to make sure that an `@layer` ordering is at the beginning of the CSS build file.
  if (!cssContentStripped.match(/^@layer [^{]+?;/)) {
    throw new Error(`Missing @layer ordering at the start of the CSS build file`);
  }
  
  logger.log('verify:build – No issues found');
};


//
// Run
//

const printUsage = () => {
  const { logger } = getServices();
  
  logger.info(dedent`
    Usage: verify.ts <cmd> <...args>
    
    Commands:
      - verify:build
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
      case 'verify:build': await runVerifyBuild(argsForCommand); break;
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
