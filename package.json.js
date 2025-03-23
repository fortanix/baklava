
import * as fs from 'node:fs';


// Generator for package.json (to allow some more convenient syntax, like comments)
// Usage:
// $ node package.json.js # Generates an updated `package.json` file

const packageConfig = {
  name: '@fortanix/baklava',
  version: '1.0.0-beta-20250219',
  license: 'MPL-2.0',
  author: 'Fortanix',
  description: 'Fortanix Baklava design system',
  repository: { type: 'git', url: 'git+https://github.com/fortanix/baklava.git' },
  
  files: [
    'src',
    'app',
    'dist',
    'LICENSE',
    'CHANGELOG.md',
    'README.md',
  ],
  sideEffects: ['*.css'],
  type: 'module',
  exports: {
    '.': {
      'types': './dist/baklava.d.ts',
      //'require': './dist/baklava.cjs',
      'default': './dist/baklava.js',
    },
    // Expose variables for use in consumer components
    './styling/variables.scss': {
      'default': './src/styling/variables.scss',
    },
    // Expose mixins for use in consumer components
    './styling/defs.scss': {
      'default': './src/styling/defs.scss',
    },
    // Expose layer ordering, since consumers may want to explicitly emit these first (see note in README.md)
    './styling/layers.scss': {
      'default': './src/styling/layers.scss',
    },
  },
  
  scripts: {
    // Utilities
    'gen-package': 'node package.json.js', // Update `package.json`
    'install-project': 'npm run gen-package && npm install', // Project-specific version of `npm install`
    
    // CLI
    'node': 'node --import=tsx',
    'repl': 'tsx',
    'plop': 'NODE_OPTIONS="--import tsx" plop',
    'import': 'tsx scripts/import.ts',
    'automate': 'tsx scripts/automate.ts',
    'verify': 'tsx scripts/verify.ts',
    
    // Library
    //'lib:build': '',
    
    // App
    'serve:dev': 'vite --config=./vite.config.ts serve',
    //'build': 'vite --config=./vite.config.ts --emptyOutDir build && cp src/types/vite-env.d.ts dist && echo \'{"name": "@fortanix/baklava","main": "./baklava.js"}\' > dist/package.json',
    'build': 'tsc -b && vite --config=./vite.config.ts build && npm run verify verify:build',
    
    // Storybook
    'storybook:serve': 'storybook dev -p 6006',
    'storybook:build': 'storybook build --docs',
    'chromatic': 'npx chromatic', // Must be run with `CHROMATIC_PROJECT_TOKEN` env variable (secret)
    
    // Static analysis
    'check:types': 'tsc -b',
    'lint:style': `stylelint 'src/**/*.scss'`,
    'lint:script': 'biome lint',
    'lint': 'npm run lint:style; npm run lint:script',
    
    // Test
    // Note: use `vitest run --root=. src/...` to run a single test file
    //'test:unit': 'vitest run --root=.', // Need to specify `--root=.` since the vite root is set to `./app`
    'test': 'npm run check:types && npm run lint:style', // TODO: add `lint:script`, `test:unit`
    'test-ui': 'vitest --ui',
    'coverage': 'vitest run --coverage',
    
    // Browser automation tests
    // https://github.com/storybookjs/test-runner?tab=readme-ov-file#2-running-against-locally-built-storybooks-in-ci
    'test:storybook': 'test-storybook --failOnConsole --browsers chromium --maxWorkers=1', // For text only: FORCE_COLOR=false
    // Note: the following assumes `localhost:6006` is free, so don't run it if a dev server is already running
    'test:storybook-ci': `
      npx playwright install --with-deps chromium\
        && npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue"\
          "npm run storybook:build --quiet && npx http-server storybook-static --port 6006 --silent"\
          "npx wait-on tcp:6006 && npm run test:storybook"
    `,
    
    // Shorthands
    'start': 'npm run storybook:serve',
    
    // Hooks
    'prepare': 'npm run build',
  },
  
  // Dev dependencies (only needed when building, or making changes to the code)
  devDependencies: {
    // CLI
    'plop': '^4.0.1',
    'tsx': '^4.19.2',
    'glob': '^11.0.1',
    
    // Build
    'browserslist': '^4.24.4',
    'vite': '^5.4.11', // Cannot yet upgrade to v6, causes some odd pre-transform errors in lightningcss
    '@vitejs/plugin-react': '^4.3.4',
    'vite-plugin-dts': '^4.5.0',
    'vite-plugin-lib-inject-css': '^2.2.1',
    'vite-plugin-svg-icons': '^2.0.1',
    
    // Static analysis
    'typescript': '^5.7.3',
    '@types/node': '^22.13.1',
    'stylelint': '^16.14.1',
    'stylelint-config-standard-scss': '^14.0.0',
    'stylelint-use-logical': '^2.1.2',
    '@biomejs/biome': '^1.9.4',
    
    // Testing
    'vitest': '^3.0.5',
    '@vitest/ui': '^3.0.5',
    'axe-playwright': '^2.0.3',
    '@ngneat/falso': '^7.3.0',
    
    // Storybook
    'storybook': '^8.5.3',
    '@storybook/react': '^8.5.3',
    '@storybook/react-vite': '^8.5.3',
    '@storybook/blocks': '^8.5.3',
    '@storybook/test': '^8.5.3',
    '@storybook/test-runner': '^0.21.0',
    '@storybook/addon-essentials': '^8.5.3',
    '@storybook/addon-a11y': '^8.5.3',
    '@storybook/addon-interactions': '^8.5.3',
    '@storybook/addon-links': '^8.5.3',
    '@storybook/addon-storysource': '^8.5.3',
    '@storybook/addon-designs': '^8.2.0',
    'chromatic': '^11.25.2',
    '@chromatic-com/storybook': '^3.2.3', // Chromatic integration for Storybook
    //'storybook-addon-pseudo-states': '^3.1.1',
    'storybook-dark-mode': '^4.0.2',
    '@percy/cli': '^1.30.7',
    '@percy/storybook': '^6.0.3',
    
    // Styling
    'vite-css-modules': '^1.6.0',
    'typescript-plugin-css-modules': '^5.0.1',
    'sass-embedded': '^1.83.1',
    'lightningcss': '^1.29.1',
    
    // React
    '@types/react': '^19.0.8',
    '@types/react-dom': '^19.0.2',
    
    // Data table
    '@types/react-table': '^7.7.20',
  },
  
  // Dependencies needed when running the generated build
  dependencies: {
    // Utilities
    'date-fns': '^4.1.0',
    'message-tag': '^0.10.0',
    'immer': '^10.1.1',
    
    // React
    'react': '^19.0.0',
    'react-dom': '^19.0.0',
    'react-error-boundary': '^5.0.0',
    'classnames': '^2.5.1',
    'zustand': '^5.0.3',
    '@uidotdev/usehooks': '^2.4.1',
    
    '@floating-ui/react': '^0.26.28',
    'react-table': '^7.8.0',
    'react-datepicker': '^8.0.0',
    
    'effect': '^3.12.9',
    'react-hook-form': '^7.54.2',
    '@tanstack/react-virtual': '^3.13.2',
    
    'optics-ts': '^2.4.1',
  },
  peerDependencies: {
    'react': '>= 19.0.0',
    'react-dom': '>= 19.0.0',
  },
  peerDependenciesMeta: {},
  optionalDependencies: {
    // Note: if you're hitting issues in GitHub CI where platform-specific dependencies are not found, try removing
    // `node_modules` and regenerating `package-lock.json` (see: https://github.com/npm/cli/issues/4828).
    //'@rollup/rollup-linux-x64-gnu': '...', // Adding the optionalDependency works, but you'll just get other errors
  },
  overrides: {
    // TODO: Revisit after updating react-table to v8
    'react-table': {
      'react': '$react',
      'react-dom': '$react-dom',
    },
    // https://github.com/storybookjs/addon-designs/issues/254
    '@storybook/addon-designs': {
      'react': '$react',
      'react-dom': '$react-dom',
    },
  },
};


const makePackageJson = () => {
  const packageJson = {
    // http://stackoverflow.com/questions/14221579/how-do-i-add-comments-to-package-json
    '//': 'NOTE: This is a generated file. Do not edit this file directly, edit package.json.js instead.',
    ...packageConfig,
  };
  
  /*
  const packageJsonCurrent = (() => {
    try {
      return JSON.parse(fs.readFileSync('./package.json'));
    } catch (error) {
      return null;
    }
  })();
  // Inherit the version from the existing `package.json`, to allow facilitate version bumps through CI
  if (packageJsonCurrent?.version && typeof packageJson.version !== 'string') {
    packageJson.version = packageJsonCurrent.version;
  }
  */
  
  return packageJson;
};

// Write to `package.json`
fs.writeFileSync('./package.json', `${JSON.stringify(makePackageJson(), null, 2)}\n`);
console.info('Generated package.json');
