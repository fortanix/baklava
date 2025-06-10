
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

const readPackageJson = async () => {
  const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
  const packageJsonContent = (await fs.readFile(packageJsonPath)).toString();
  return JSON.parse(packageJsonContent); // May throw
};


//
// Commands
//

// Utility automation to prepopulate a URL with the parameters for a new release on GitHub.
export const runGithubCreateReleasePullRequest = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const branchName = await getCurrentGitBranch();
  
  const packageJson = await readPackageJson();
  const version = packageJson.version;
  
  // https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/using-query-parameters-to-create-a-pull-request
  const prUrl = new URL(`https://github.com/fortanix/baklava/compare/master...${branchName}`);
  prUrl.search = new URLSearchParams({
    quick_pull: '1',
    title: `Release v${version}`,
    labels: `new-release`,
    body: `Update the version to v${version}.`,
  }).toString();
  
  logger.log('\n');
  logger.log(`Open the following URL in your browser to create the pull request:`);
  logger.log(prUrl.toString());
  logger.log('\n');
};

// Utility automation to prepopulate a URL with the parameters for a new release on GitHub.
export const runGithubCreateRelease = async (args: ScriptArgs) => {
  const { logger } = getServices();
  
  const packageJson = await readPackageJson();
  const version = packageJson.version;
  const isPrerelease = ['alpha', 'beta', 'rc', 'pre'].some(qualifier => version.includes(`-${qualifier}`));
  
  // https://docs.github.com/en/repositories/releasing-projects-on-github/automation-for-release-forms-with-query-parameters
  const releaseUrl = new URL('https://github.com/fortanix/baklava/releases/new');
  releaseUrl.search = new URLSearchParams({
    tag: `v${version}`,
    prerelease: isPrerelease ? '1' : '0',
    title: `Release v${version}`,
  }).toString();
  
  logger.log('\n');
  logger.log(`Open the following URL in your browser, and add the release notes:`);
  logger.log(releaseUrl.toString());
  logger.log('\n');
};


//
// Run
//

const printUsage = () => {
  const { logger } = getServices();
  
  logger.info(dedent`
    Usage: automate.ts <cmd> <...args>
    
    Commands:
      - github:create-release-pr
      - github:create-release
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
      case 'github:create-release-pr': await runGithubCreateReleasePullRequest(argsForCommand); break;
      case 'github:create-release': await runGithubCreateRelease(argsForCommand); break;
      default:
        logger.error(`Unknown command '${command}'\n`);
        printUsage();
        break;
    }
  });
};

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
