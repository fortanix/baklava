/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './preview.scss'; // Note: must be imported before any other CSS for `@layer` to work
import 'virtual:svg-icons/register';

import { type Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';
import { withThemeByClassName } from '@storybook/addon-themes';
import { DocsContainer } from '@storybook/addon-docs/blocks';

import { BaklavaProvider } from '../src/context/BaklavaProvider.tsx';


const preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',

      toolbar: {
        title: 'Theme',

        icon: 'mirror',

        items: [
          { value: 'light', title: 'Theme Light', icon: 'sun'},
          { value: 'dark', title: 'Theme Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', 
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'bk-theme--light',
        dark: 'bk-theme--dark',
      },
      defaultTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      parentSelector: 'html',
    }),


    (Story, context) => {
      const selectedTheme = context.globals.theme || 'light';
      document.documentElement.dataset.theme = selectedTheme;

      return (<BaklavaProvider><Story /></BaklavaProvider>);
    },
  ],
  
  parameters: {
    // Disable specific default tools
    backgrounds: { disable: true },
    themes: { disable: true },
    options: {
      storySort: {
        order: [
          'Docs',
          [
            'Introduction',
            'Colors',
            'Typography',
            'Iconography',
          ],
          'typography',
          [
            'Global',
            'Heading',
            'Prose',
          ],
          'components',
          [
            'graphics',
            [
              'Icon',
              'Spinner',
              'PlaceholderEmpty',
              'ProgressBar',
            ],
            'text',
            [
              'TextLine',
              'Tag',
            ],
            'containers',
            [
              'Panel',
              'Card',
              'Banner',
              'Dialog',
              'Disclosure',
              'Accordion',
            ],
            'actions',
            [
              'Link',
              'LinkAsButton',
              'Button',
              'ButtonAsLink',
              'IconButton',
              'CardAction',
            ],
            'overlays',
            [
              'SpinnerModal',
              'DialogModal',
              'DialogOverlay',
              'ToastProvider',
              'Tooltip',
              'MenuProvider',
              'MenuLazyProvider',
              'MenuMultiProvider',
              'MenuMultiLazyProvider',
            ],
            'lists',
            [
              'Property',
              'PropertyList',
              'PropertyGrid',
            ],
            'forms',
            [
              'context',
              [
                'Form',
                'SubmitButton',
              ],
              'common',
              [
                'Label',
                'FieldSet',
                'FileInfo',
              ],
              'controls',
              [
                'Checkbox',
                [
                  'CheckboxTri',
                ],
                'CheckboxGroup',
                'Switch',
                'Radio',
                'RadioGroup',
                'RadioGroupAsCards',
                'SegmentedControl',
                'Input',
                [
                  'InputSearch',
                  'InputSensitive',
                  'InputPassword',
                ],
                'InputFile',
                'TextArea',
                'TextAreaWithFileUpload',
                'ListBox',
                'ListBoxLazy',
                'ListBoxMulti',
                'ListBoxMultiLazy',
                'ComboBox',
                'ComboBoxLazy',
                'ComboBoxMulti',
                'ComboBoxMultiLazy',
                'Select',
                'SelectMulti',
                'datetime',
                [
                  'DatePicker',
                  'DateRangePicker',
                  'DateInput',
                  'TimeInput',
                  'DateTimeInput',
                ],
              ],
              'fields',
              [
                'CheckboxGroup',
                'CheckboxField',
                'RadioField',
                'InputField',
                'InputFieldWithTags',
                'TextAreaField',
                'TextAreaWithFileUploadField',
              ],
            ],
            'navigations',
            [
              'Tabs',
              'Stepper',
            ],
            'tables',
            [
              'DataTableEager',
              'DataTableLazy',
              'DataTableStream',
              'SearchInput',
              'MultiSearch',
            ],
          ],
          'layouts',
          [
            'FormLayout',
            'DialogLayout',
            'PageLayout',
            'AppLayout',
            [
              'Logo',
              'Header',
              'Nav',
              'Sidebar',
              'Breadcrumbs',
            ],
            'PublicLayout',
          ],
          'fortanix',
          [
            'FortanixLogo',
          ],
        ],
      },
    },
    
    layout: 'centered',
    
    //actions: { argTypesRegex: '^on[A-Z].*' },
    /*
    backgrounds: {
      values: [
        { name: 'light', value: '#F7F9FC' },
        { name: 'dark', value: '#333' },
      ],
    },
    */
    controls: {
      //expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    
    docs: {
      container: (props: any) => {
        const isDark = document.documentElement.dataset.theme === 'dark';
        
        return (
          <DocsContainer {...props} theme={isDark ? themes.dark : themes.light}/>
        );
      },
      // page: () => (
      //   <>
      //     <Title />
      //     <Subtitle />
      //     <Description />
      //     <Primary />
      //     <Controls />
      //     <Stories />
      //   </>
      // ),
      codePanel: true,
    },
    
    // https://storybook.js.org/docs/8.5/writing-tests/accessibility-testing
    // https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
    a11y: {
      config: {
        // Format: { id: <rule-name>, enabled: <boolean>, selector: <css-selector> }
        rules: [
          // Known accessibility issues (need to fix these)
          //{ id: 'color-contrast', enabled: false, selector: '*:not(button[class*=primary])' },
          //{ id: 'color-contrast', enabled: false, selector: '*' },
        ],
      },

      // Axe's options parameter
      options: {},

      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
} satisfies Preview;

export default preview;
