/// <reference types="vitest" />

import * as path from 'node:path';
//import * as url from 'node:url';
//import { glob } from 'glob';

import browserslist from 'browserslist';
import { defineConfig } from 'vite';
import { Features as LightningCssFeatures, browserslistToTargets } from 'lightningcss';

// Vite plugins
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import svgr from 'vite-plugin-svgr';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import react from '@vitejs/plugin-react';


export default defineConfig({
  root: './app', // Run with `app` as root, so that files like `index.html` are by default referenced from there
  base: './', // Assets base URL
  
  test: {
    root: '.', // Override the default `root` of `./app`
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup-rtl.ts'],
    deps: {
      optimizer: {
        web: {
          exclude: [], // Don't exclude externals from bundling in tests
        },
      },
    },
  },
  
  assetsInclude: ['**/*.md'], // Add `.md` as static asset type
  
  resolve: {
    alias: {
      // Needed for file references in Sass code (relative paths don't resolve properly when imported with `@use`)
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  plugins: [
    react(),
    
    svgr(),
    
    // Handle SVG sprite icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
      symbolId: 'baklava-icon-[name]',
      inject: 'body-last',
      customDomId: 'baklava-icon-sprite',
    }),
    //libInjectCss(), // Disabled for now (`.css` import causes issues in vitest)
    
    // Generate `.d.ts` files
    dts({
      // https://github.com/qmhc/vite-plugin-dts/issues/275#issuecomment-1963123685
      outDir: 'dist', // dts.root + 'dist' => where we need to rollup.
      root: '../', //vite.root + ../ = ./ = (dts.root)
      staticImport: true,
      insertTypesEntry: true,
      //rollupTypes: true, // Issue: https://github.com/qmhc/vite-plugin-dts/issues/399
      
      //include: [path.resolve(__dirname, 'app')],
      tsconfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
    }),
  ],
  
  css: {
    // Configure preprocessing using Sass
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['mixed-decls'], // https://sass-lang.com/documentation/breaking-changes/mixed-decls
      },
    },
    
    // Configure postprocessing using lightningcss
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist(
        `fully supports css-nesting AND fully supports css-cascade-layers`
      )),
      exclude: LightningCssFeatures.LightDark, // Do not include the `light-dark()` polyfill (it's too buggy)
      cssModules: {
        //pattern: '[hash]_[local]',
        grid: false, // Workaround for https://github.com/parcel-bundler/lightningcss/issues/762
      },
    },
  },
  
  // https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma
  // https://victorlillo.dev/blog/react-typescript-vite-component-library
  build: {
    emptyOutDir: true,
    /*
    rollupOptions: {
      input: {
        baklava: path.resolve(__dirname, 'app/main.tsx'),
      },
    },
    */
    
    copyPublicDir: false, // Do not copy `./public` into the output dir
    outDir: path.resolve(__dirname, 'dist'),
    lib: {
      entry: path.resolve(__dirname, 'app/lib.ts'),
      name: 'baklava',
      fileName: 'baklava',
      //cssFileName: 'baklava',
      formats: ['es'],
    },
    rollupOptions: {
      // Do not include React in the output (rely on the consumer to bring their own version)
      external: ['react', 'react/jsx-runtime'],
      // input: Object.fromEntries(
      //   glob.sync('src/**/*.{ts,tsx}', {
      //     ignore: ['src/**/*.d.ts'],
      //   }).map(file => [
      //     // The name of the entry point
      //     // lib/nested/foo.ts becomes nested/foo
      //     path.relative(
      //       'src',
      //       file.slice(0, file.length - path.extname(file).length)
      //     ),
      //     // The absolute path to the entry file
      //     // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
      //     url.fileURLToPath(new URL(file, import.meta.url)),
      //   ]),
      // ),
    },
  },
});
