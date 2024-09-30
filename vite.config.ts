/// <reference types="vitest" />

import { glob } from 'glob';
import * as path from 'node:path';
import * as url from 'node:url';

import { defineConfig } from 'vite';

// Vite plugins
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';

// PostCSS plugins
//import postcssSimpleVars from 'postcss-simple-vars';
//import postcssMixins from 'postcss-mixins';
//import postcssLightDark from '@csstools/postcss-light-dark-function';


// https://vitejs.dev/config
export default defineConfig({
  root: './app', // Run with `app` as root, so that files like `index.html` are by default referenced from there
  base: './', // Assets base URL
  
  assetsInclude: ['**/*.md'], // Add `.md` as static asset type
  
  plugins: [
    patchCssModules(), // https://www.npmjs.com/package/vite-css-modules
    react(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
      symbolId: 'baklava-icon-[name]',
      inject: 'body-last',
      customDomId: 'baklava-icon-sprite',
    }),
    libInjectCss(),
    dts({
      include: [path.resolve(__dirname, 'src')],
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  
  css: {
    modules: {
      // https://github.com/madyankin/postcss-modules?tab=readme-ov-file#generating-scoped-names
      generateScopedName: '[local]_[hash:base64:5]',
      //localsConvention: 'camelCase',
    },
    
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    
    // postcss: {
    //   plugins: [
    //     postcssSimpleVars({ variables: {} }),
    //     postcssMixins(),
    //     postcssLightDark(), // Breaks with mixins, see e.g. isolate() in combination with `Modal`
    //   ],
    // },
    
    transformer: 'lightningcss',
    lightningcss: {
      cssModules: {
        // @ts-expect-error The `grid` prop is missing from the vite type at the moment, but lightningcss supports it
        grid: false, // Workaround for https://github.com/parcel-bundler/lightningcss/issues/762
      },
    },
  },
  
  // https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma
  build: {
    /*
    emptyOutDir: true,
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
      formats: ['es'],
    },
    rollupOptions: {
      // Do not include React in the output (rely on the consumer to bring their own version)
      external: ['react', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('src/**/*.{ts,tsx}', {
          ignore: ['src/**/*.d.ts'],
        }).map(file => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          path.relative(
            'src',
            file.slice(0, file.length - path.extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          url.fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
    },
  },
});
