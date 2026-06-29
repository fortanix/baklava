/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type StorybookConfig } from '@storybook/react-vite';
import { withoutVitePlugins } from '@storybook/builder-vite';

const config: StorybookConfig = {
  core: {
    disableTelemetry: true,
  },

  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: false,
    },
  },

  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-a11y', // Accessibility
    '@storybook/addon-links', // Allows creating links from one story to another
    '@storybook/addon-designs',
    '@chromatic-com/storybook',
    //'@storybook-community/storybook-dark-mode',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',

    // Note: `pseudo-states` does not work properly due to bugs like these:
    // https://github.com/chromaui/storybook-addon-pseudo-states/issues/101
    //'storybook-addon-pseudo-states',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: './tsconfig.app.json', // https://github.com/storybookjs/storybook/issues/30015
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true, // Prevent issues with props of type `undefined | T`
    },
  },

  // https://storybook.js.org/docs/configure/images-and-assets#referencing-fonts-in-stories
  staticDirs: ['../src/assets'],

  async viteFinal(config) {
    // Remove `vite-dts` plugin since it can cause some issues on storybook builds (and isn't necessary)
    // https://github.com/qmhc/vite-plugin-dts/issues/275
    config.plugins = await withoutVitePlugins(config.plugins, ['vite:dts']);
    return config;
  },
};
export default config;
