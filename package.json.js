
import * as fs from 'node:fs';


// Generator for package.json (to allow some more convenient syntax, like comments)
// Usage:
// $ node package.json.js # Generates an updated `package.json` file

const packageConfig = {
  name: '@fortanix/baklava',
  version: '1.0.0-beta-20251209',
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
      'sass': './dist/baklava.css',
      'types': './dist/baklava.d.ts',
      //'require': './dist/baklava.cjs',
      'default': './dist/baklava.js',
    },
    // Expose mixins for use in consumer components
    './styling/defs.scss': {
      'default': './src/styling/public/defs.scss',
    },
    // Expose layer ordering, since consumers may want to explicitly emit these first (see note in README.md)
    './styling/layers.scss': {
      'default': './src/styling/public/layers.scss',
    },
    
    // Legacy exports
    './legacy': {
      'types': './dist/legacy.d.ts',
      'default': './dist/legacy.js',
    },
    './legacy/styling/defs.scss': {
      'default': './src/legacy/style/defs.scss',
    },
  },
  
  scripts: {
    // Utilities
    'gen-package': 'node package.json.js', // Update `package.json`
    'install-project': 'npm run gen-package && npm install', // Project-specific version of `npm install`
    
    // CLI
    'plop': 'plop',
    'import': 'node scripts/import.ts',
    'automate': 'node scripts/automate.ts',
    'verify': 'node scripts/verify.ts',
    
    // Library
    //'lib:build': '',
    
    // App
    'serve:dev': 'vite --config=./vite.config.ts serve',
    //'build': 'vite --config=./vite.config.ts --emptyOutDir build && cp src/types/vite-env.d.ts dist && echo \'{"name": "@fortanix/baklava","main": "./baklava.js"}\' > dist/package.json',
    'build': 'vite --config=./vite.config.ts build && npm run verify verify:build',
    
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
    // Note: use `vitest run src/...` to run a single test file
    'test:unit': 'vitest run --project=unit',
    'test': `${/*npm run check:types && */''} npm run test:unit && npm run lint:style && npm run verify verify:source`, // TODO: add `lint:script`
    'test-ui': 'vitest --ui',
    'coverage': 'vitest run --coverage',
    
    // Browser automation tests
    // https://github.com/storybookjs/test-runner?tab=readme-ov-file#2-running-against-locally-built-storybooks-in-ci
    'test:storybook': 'vitest run --project=storybook',
    
    // Shorthands
    'start': 'npm run storybook:serve',
    
    // Hooks
    'prepare': 'npm run build',
  },
  
  // Dev dependencies (only needed when building, or making changes to the code)
  devDependencies: {
    // CLI
    'plop': '^4.0.4',
    'glob': '^13.0.0',
    
    // Build
    'browserslist': '^4.28.1',
    'vite': '^7.2.6',
    '@vitejs/plugin-react': '^5.1.1',
    'vite-plugin-dts': '^4.5.4',
    'vite-plugin-lib-inject-css': '^2.2.1',
    'vite-plugin-svgr': '^4.5.0',
    'vite-plugin-svg-icons-ng': '^1.5.2',
    
    // Static analysis
    'typescript': '^5.9.3',
    '@types/node': '^24.10.1',
    'stylelint': '^16.26.1',
    'stylelint-config-standard-scss': '^16.0.0',
    'stylelint-use-logical': '^2.1.2',
    '@biomejs/biome': '^2.3.8',
    
    // Testing
    'jsdom': '^27.2.0', // Needed for `@testing-library/react`
    'vitest': '^4.0.15',
    '@vitest/ui': '^4.0.15',
    '@vitest/browser-playwright': '^4.0.15',
    '@vitest/coverage-v8': '^4.0.15',
    '@testing-library/react': '^16.3.0',
    '@testing-library/user-event': '^14.6.1',
    '@testing-library/jest-dom': '^6.9.1',
    '@ngneat/falso': '^8.0.2',
    'mockdate': '^3.0.5',
    'playwright': '^1.57.0',
    
    // Storybook
    'storybook': '^10.1.10',
    '@storybook/react-vite': '^10.1.4',
    '@storybook/addon-a11y': '^10.1.10',
    '@storybook/addon-designs': '^11.1.0',
    '@storybook/addon-docs': '^10.1.10',
    '@storybook/addon-links': '^10.1.10',
    '@storybook/addon-vitest': '^10.1.10',
    'chromatic': '^13.1.4',
    '@chromatic-com/storybook': '^4.1.3', // Chromatic integration for Storybook
    //'storybook-addon-pseudo-states': '^3.1.1',
    //'@storybook-community/storybook-dark-mode': '^6.0.0',
    //'@percy/cli': '^1.31.2',
    //'@percy/storybook': '^9.0.0',
    
    // Styling
    'typescript-plugin-css-modules': '^5.2.0',
    'sass-embedded': '^1.93.3',
    'lightningcss': '^1.30.2',
    
    // React
    '@types/react': '^19.2.7',
    '@types/react-dom': '^19.2.3',
    
    // Data table
    '@types/react-table': '^7.7.20',
    
    // Legacy
    '@types/react-is': '^19.0.0',
    '@types/react-router-dom': '^5.3.0',
  },
  
  // Dependencies needed when running the generated build
  dependencies: {
    // Utilities
    'date-fns': '^4.1.0',
    'message-tag': '^0.10.0',
    
    // React
    'react': '^19.2.1',
    'react-dom': '^19.2.1', // Must be in sync with `react`
    'react-error-boundary': '^6.0.0',
    'classnames': '^2.5.1',
    'zustand': '^5.0.9',
    
    '@floating-ui/react': '^0.27.16',
    'react-table': '^7.8.0',
    'react-datepicker': '^8.10.0',
    
    'effect': '^3.19.9',
    'react-hook-form': '^7.68.0',
    '@tanstack/react-virtual': '^3.13.12',
    
    //'optics-ts': '^2.4.1',
    
    // Legacy packages (for `src/legacy`)
    'react-is': '^19.1.0',
    'focus-trap-react': '^10.0.0',
    'react-textarea-autosize': '^8.3.2',
    'react-toastify': '^11.0.5',
    'react-router-dom': '^5.3.0',
    '@popperjs/core': '^2.9.2',
    'react-popper': '^2.2.5',
  },
  peerDependencies: {
    'react': '>= 19.0.0',
    'react-dom': '>= 19.0.0',
    
    // Legacy peer dependencies
    'react-router-dom': '>= 5.0.0',
    'react-toastify': '>= 11.0.0',
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
    'react-popper': {
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
