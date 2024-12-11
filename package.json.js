
import * as fs from 'node:fs';


// Generator for package.json (to allow some more convenient syntax, like comments)
// Usage:
// $ node package.json.js # Generates an updated `package.json` file

const packageConfig = {
  name: '@fortanix/baklava',
  version: '1.0.0-beta-20241206',
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
    './styling/variables.scss': {
      'default': './src/styling/variables.scss',
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
    
    // Library
    //'lib:build': '',
    
    // App
    'serve:dev': 'vite --config=./vite.config.ts serve',
    //'build': 'vite --config=./vite.config.ts --emptyOutDir build && cp src/types/vite-env.d.ts dist && echo \'{"name": "@fortanix/baklava","main": "./baklava.js"}\' > dist/package.json',
    'build': 'tsc -b && vite --config=./vite.config.ts build',
    
    // Storybook
    'storybook:serve': 'storybook dev -p 6006',
    'storybook:build': 'storybook build --docs',
    'chromatic': 'npx chromatic', // Must be run with `CHROMATIC_PROJECT_TOKEN` env variable (secret)
    
    // Static analysis
    'check:types': 'tsc -b',
    'lint:style': `stylelint 'src/**/*.scss'`,
    'lint:script': 'biome lint',
    'lint': 'npm run lint:style && npm run lint:script',
    
    // Test
    // Note: use `vitest run --root=. src/...` to run a single test file
    //'test': 'vitest run --root=.', // Need to specify `--root=.` since the vite root is set to `./app`
    'test': 'npm run check:types && npm run lint:style',
    'test-ui': 'vitest --ui',
    'coverage': 'vitest run --coverage',
    
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
    'glob': '^11.0.0',
    
    // Build
    'vite': '^5.4.11', // Cannot use vite v6, blocked by https://github.com/privatenumber/vite-css-modules/issues/13
    '@vitejs/plugin-react': '^4.3.4',
    'vite-plugin-dts': '^4.3.0',
    'vite-plugin-lib-inject-css': '^2.1.1',
    'vite-plugin-svg-icons': '^2.0.1',
    
    // Static analysis
    'typescript': '^5.7.2',
    '@types/node': '^22.10.1',
    'stylelint': '^16.11.0',
    'stylelint-config-standard-scss': '^14.0.0',
    '@biomejs/biome': '^1.9.4',
    
    // Testing
    'vitest': '^2.1.8',
    '@vitest/ui': '^2.1.8',
    
    // Storybook
    'storybook': '^8.4.7',
    '@storybook/react': '^8.4.7',
    '@storybook/react-vite': '^8.4.7',
    '@storybook/blocks': '^8.4.7',
    '@storybook/test': '^8.4.7',
    '@storybook/addon-essentials': '^8.4.7',
    '@storybook/addon-a11y': '^8.4.7',
    '@storybook/addon-interactions': '^8.4.7',
    '@storybook/addon-links': '^8.4.7',
    '@storybook/addon-storysource': '^8.4.7',
    '@storybook/addon-designs': '^8.0.4',
    'chromatic': '^11.20.0',
    '@chromatic-com/storybook': '^3.2.2', // Chromatic integration for Storybook
    //'storybook-addon-pseudo-states': '^3.1.1',
    'storybook-dark-mode': '^4.0.2',
    '@percy/cli': '^1.30.4',
    '@percy/storybook': '^6.0.3',
    
    // Styling
    'vite-css-modules': '^1.6.0',
    'typescript-plugin-css-modules': '^5.0.1',
    'sass-embedded': '^1.82.0',
    'postcss-color-contrast': '^1.1.0',
    'lightningcss': '^1.28.2',
    
    // React
    '@types/react': '^19.0.1',
    '@types/react-dom': '^19.0.1',
  },
  
  // Dependencies needed when running the generated build
  dependencies: {
    // Utilities
    'date-fns': '^4.1.0',
    'message-tag': '^0.10.0',
    
    // React
    'classnames': '^2.5.1',
    'react': '^19.0.0',
    'react-dom': '^19.0.0',
    'react-error-boundary': '^4.1.2',
    
    '@floating-ui/react': '^0.26.28',
    'react-toastify': '^10.0.6',
    
    'effect': '^3.11.3',
    'react-hook-form': '^7.54.0',
    
    'optics-ts': '^2.4.1',
  },
  peerDependencies: {
    'react': '>= 19.0.0',
    'react-dom': '>= 19.0.0',
  },
  peerDependenciesMeta: {},
  overrides: {
    // Issue: https://github.com/storybookjs/addon-designs/issues/246
    '@storybook/addon-designs': {
      'react': '$react',
      'react-dom': '$react-dom',
    },
    // Issue: https://github.com/storybookjs/icons/issues/34
    '@storybook/icons': {
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
fs.writeFileSync('./package.json', JSON.stringify(makePackageJson(), null, 2) + '\n');
