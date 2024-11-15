
import * as fs from 'node:fs';


// Generator for package.json (to allow some more convenient syntax, like comments)
// Usage:
// $ node package.json.js # Generates an updated `package.json` file

const packageConfig = {
  name: '@fortanix/baklava',
  version: '1.0.0-beta-20241115',
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
    'install-project': 'npm run gen-package && npm install --force',
    
    // CLI
    'node': 'node --import=tsx',
    'repl': 'tsx',
    'plop': 'NODE_OPTIONS="--import tsx" plop',
    'import': 'tsx scripts/import.ts',
    
    // Library
    //'lib:build': '',
    
    // App
    'serve:dev': 'vite --config=./vite.config.ts serve',
    //'build': 'vite --config=./vite.config.ts --emptyOutDir build && cp src/types/vite-env.d.ts dist && echo \'{"name": "@fortanix/baklava","main": "./baklava.js"}\' > dist/package.json',
    'build': 'vite --config=./vite.config.ts --emptyOutDir build',
    
    // Storybook
    'storybook:serve': 'storybook dev -p 6006',
    'storybook:build': 'storybook build --docs',
    
    // Static analysis
    'check-types': 'tsc --noEmit',
    'lint:style': `stylelint 'src/**/*.scss'`,
    'lint:script': 'biome',
    'lint': 'npm run list:style && npm run lint:script',
    
    // Test
    // Note: use `vitest run --root=. src/...` to run a single test file
    'test': 'vitest run --root=.', // Need to specify `--root=.` since the vite root is set to `./app`
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
    'tsx': '^4.19.1',
    'glob': '^11.0.0',
    
    // Build
    'vite': '^5.4.8',
    '@vitejs/plugin-react': '^4.3.2',
    'vite-plugin-dts': '^4.2.3',
    'vite-plugin-lib-inject-css': '^2.1.1',
    'vite-plugin-svg-icons': '^2.0.1',
    
    // Static analysis
    'typescript': '^5.6.2',
    'stylelint': '^16.9.0',
    'stylelint-config-standard-scss': '^13.1.0',
    '@biomejs/biome': '^1.9.3',
    
    // Testing
    'vitest': '^2.1.2',
    '@vitest/ui': '^2.1.2',
    
    // Storybook
    'storybook': '^8.3.5',
    '@storybook/react': '^8.3.5',
    '@storybook/react-vite': '^8.3.5',
    '@storybook/blocks': '^8.3.5',
    '@storybook/test': '^8.3.5',
    '@storybook/addon-essentials': '^8.3.5',
    '@storybook/addon-a11y': '^8.3.5',
    '@storybook/addon-interactions': '^8.3.5',
    '@storybook/addon-links': '^8.3.5',
    '@storybook/addon-storysource': '^8.3.5',
    '@storybook/addon-designs': '^8.0.3',
    '@chromatic-com/storybook': '^2.0.2', // Chromatic integration for Storybook
    //'storybook-addon-pseudo-states': '^3.1.1',
    'storybook-dark-mode': '^4.0.2',
    '@percy/cli': '^1.29.4',
    '@percy/storybook': '^6.0.2',
    
    // Styling
    'vite-css-modules': '^1.4.2',
    'typescript-plugin-css-modules': '^5.0.1',
    'sass': '^1.79.4',
    //'postcss': '^8.4.34',
    //'@types/postcss-mixins': '^9.0.5',
    //'postcss-simple-vars': '^7.0.1',
    //'postcss-mixins': '^10.0.1',
    //'@csstools/postcss-light-dark-function': '^1.0.5',
    'postcss-color-contrast': '^1.1.0',
    'lightningcss': '^1.27.0',
    
    // React
    //'@types/react': '^18.3.7',
    //'@types/react-dom': '^18.2.22',
    '@types/react': 'npm:types-react@rc',
    '@types/react-dom': 'npm:types-react-dom@rc',
  },
  
  // Dependencies needed when running the generated build
  dependencies: {
    // Utilities
    'date-fns': '^4.1.0',
    'message-tag': '^0.10.0',
    
    // React
    'classnames': '^2.5.1',
    'react': '^19.0.0-rc.1',
    'react-dom': '^19.0.0-rc.1',
    'react-error-boundary': '^4.0.13',
    
    '@floating-ui/react': '^0.26.24',
    'react-toastify': '^10.0.5',
    
    'fast-check': '^3.13.2',
    'effect': '^3.8.2',
    '@effect/schema': '^0.74.1',
    'react-hook-form': '^7.53.0',
    
    'optics-ts': '^2.4.1',
  },
  overrides: {
    // See https://react.dev/blog/2024/04/25/react-19-upgrade-guide#installing
    '@types/react': 'npm:types-react@rc',
    '@types/react-dom': 'npm:types-react-dom@rc',
  }
};

const packageConfigWithComment = {
  // http://stackoverflow.com/questions/14221579/how-do-i-add-comments-to-package-json
  '//': 'NOTE: This is a generated file. Do not edit this file directly, use package.json.js instead.',
  
  ...packageConfig,
};

// Output a valid JSON document (stripped of comments and such)
const packageConfigFormatted = JSON.stringify(packageConfigWithComment, null, 2);

// Write to `package.json`
fs.writeFileSync('./package.json', packageConfigFormatted);
