
import { dedent } from 'ts-dedent';
import { parseArgs } from 'node:util';
import * as pathUtil from 'node:path';
import { fileURLToPath } from 'node:url';
import { type PathLike, createReadStream } from 'node:fs';
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
    help?: undefined | boolean,
    silent?: undefined | boolean,
  },
  positionals: Array<string>,
};


//
// Common
//

// Return a relative path to the given absolute path, relative to the current CWD
const rel = (absolutePath: string): string => {
  return pathUtil.relative(process.cwd(), absolutePath);
};

const readFirstNBytes = async (path: PathLike, n: number): Promise<Buffer> => {
  const chunks = [];
  for await (let chunk of createReadStream(path, { start: 0, end: n-1 })) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const readSourceFiles = async (rootPath: string) => {
  const paths = await fs.readdir(rootPath, { recursive: true });
  
  const files: Array<string> = [];
  for await (const pathRel of paths) {
    const path = pathUtil.resolve(pathUtil.join(rootPath, pathRel));
    const stat = await fs.lstat(path);
    if (!stat.isFile()) { continue; }
    
    const fileName = pathUtil.basename(path);
    const fileExt = pathUtil.extname(fileName);
    const fileExtFull = fileExt === '' ? '' : '.' + fileName.split('.').slice(1).join('.');
    const isSourceFile = [
      ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'].includes(fileExt),
      !['.d.ts'].includes(fileExtFull),
      !path.includes('node_modules'),
    ].every(Boolean);
    
    if (isSourceFile) {
      files.push(pathUtil.resolve(path));
    }
  }
  
  return files;
};

const readDistCss = async () => {
  const path = fileURLToPath(new URL('../dist/lib.css', import.meta.url));
  return (await fs.readFile(path)).toString(); // May throw
};


//
// Commands
//

export const runVerifySource = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const rootPath = fileURLToPath(new URL('..', import.meta.url));
  
  const filePaths = [
    pathUtil.resolve('./plopfile.ts'),
    ...await readSourceFiles(pathUtil.join(rootPath, 'src')),
  ];
  
  let foundMissing = false;
  for (const filePath of filePaths) {
    const shouldIgnore = [
      filePath.startsWith(pathUtil.join(rootPath, 'src/styling/lib')),
      filePath.startsWith(pathUtil.join(rootPath, 'src/styling/generated')),
      filePath === pathUtil.join(rootPath, 'src/assets/icons/_icons.ts'),
    ].some(Boolean);
    
    if (shouldIgnore) { continue; }
    
    const firstChunk = (await readFirstNBytes(filePath, 100)).toString();
    const hasLicenseHeader = firstChunk.includes('Copyright (c) Fortanix');
    
    if (!hasLicenseHeader) {
      foundMissing = true;
      logger.error(`Missing license header in ${filePath}`);
    }
  }
  
  if (foundMissing) {
    throw new Error(`verify:source - Found issues in source files`);
  }
  logger.log('verify:source - No issues found');
};

export const runVerifyBuild = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  // DISABLED: this doesn't work anymore now that lightning-css takes care of reordering all the layers itself. There
  // is a no longer a single `@layer` "header" in the beginning.
  
  //const cssContent = await readDistCss();
  //const cssContentStripped = cssContent.replaceAll(`@charset "UTF-8";`, '').trim();
  
  // We need to make sure that an `@layer` ordering is at the beginning of the CSS build file.
  // if (!cssContentStripped.match(/^@layer [^{]+?;/)) {
  //   throw new Error(`Missing @layer ordering at the start of the CSS build file`);
  // }
  
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
      - verify:source
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
      case 'verify:source': await runVerifySource(argsForCommand); break;
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
