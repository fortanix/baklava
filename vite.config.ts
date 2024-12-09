/// <reference types="vitest" />

import * as path from 'node:path';
import * as url from 'node:url';
import { glob } from 'glob';

import { defineConfig } from 'vite';

// Vite plugins
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';


export default defineConfig({
  root: './app', // Run with `app` as root, so that files like `index.html` are by default referenced from there
  base: './', // Assets base URL
  
  assetsInclude: ['**/*.md'], // Add `.md` as static asset type
  
  plugins: [
    react(),
    
    // Experimental new approach to compiling CSS modules
    patchCssModules(), // https://www.npmjs.com/package/vite-css-modules
    
    // Handle SVG sprite icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
      symbolId: 'baklava-icon-[name]',
      inject: 'body-last',
      customDomId: 'baklava-icon-sprite',
    }),
    libInjectCss(),
    
    // Generate `.d.ts` files
    dts({
      // https://github.com/qmhc/vite-plugin-dts/issues/275#issuecomment-1963123685
      outDir: 'dist', // dts.root + 'dist' => where we need to rollup.
      root: '../', //vite.root + ../ = ./ = (dts.root)
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
      
      //include: [path.resolve(__dirname, 'app')],
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  
  css: {
    // Configure CSS modules
    modules: {
      // https://github.com/madyankin/postcss-modules?tab=readme-ov-file#generating-scoped-names
      generateScopedName: '[local]_[hash:base64:5]',
      //localsConvention: 'camelCase',
    },
    
    // Configure preprocessing using Sass
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    
    // Configure postprocessing using lightningcss
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        // Use minimum targets so that the `light-dark()` polyfill doesn't get applied, which is buggy.
        // https://github.com/parcel-bundler/lightningcss/issues/821
        //chrome: 123 << 16, // Minimum for `light-dark()`
        chrome: 121 << 16, // FIXME: needed for Chromatic, since it currently uses Chrome v121
        firefox: 120 << 16, // Minimum for `light-dark()`
        safari: 17 << 16 | 5 << 8, // Minimum for `light-dark()`
      },
      cssModules: {
        // @ts-expect-error This is fixed in vite v6, remove this line once we upgrade.
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
