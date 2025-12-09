
import path from 'node:path';

import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // Handle SVG sprite icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'node_modules/@fortanix/baklava/src/assets/icons')],
      symbolId: 'baklava-icon-[name]',
      inject: 'body-last',
      customDomId: 'baklava-icon-sprite',
    }),
  ],
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()), // Search up for workspace root
        '../../dist',
      ],
    },
  },
});
