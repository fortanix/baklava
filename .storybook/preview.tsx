/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './preview.scss'; // Note: must be imported before any other CSS for `@layer` to work
import 'virtual:svg-icons/register';

import { useState, useEffect } from 'react';

import { type Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';
import { DocsContainer } from '@storybook/addon-docs/blocks';

import { BaklavaProvider } from '../src/context/BaklavaProvider.tsx';


const preview = {
  decorators: [
    Story => <BaklavaProvider><Story/></BaklavaProvider>,
  ],
  
  parameters: {
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
              'MenuMultiProvider',
            ],
            'lists',
            [
              'PropertyList',
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
                'SegmentedControl',
                'Input',
                [
                  'InputSearch',
                  'InputSensitive',
                  'InputPassword',
                ],
                'TextArea',
                'ListBox',
                'ListBoxLazy',
                'ListBoxMulti',
                'ListBoxMultiLazy',
                'ComboBox',
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
          'legacy',
          [
            'docs',
            [
              'Typography',
            ],
            'components',
            [
              'typography',
              [
                'Caption',
                'Code',
                'Entity',
                'Headings',
              ],
              'icons',
              [
                'Icon',
              ],
              'buttons',
              [
                'Button',
              ],
              'Progress',
              'containers',
              [
                'Tag',
                'Panel',
                'PropertyList',
                'Accordion',
              ],
              'overlays',
              [
                'Loader',
                'Tooltip',
                'Notification',
                'Modal',
                'Dropdown',
              ],
              'forms',
              [
                'Label',
                'Checkbox',
                'Radio',
                'Input',
                'MaskedInput',
                'TextArea',
                'Select',
                [
                  'Select',
                  'MultiSelect',
                  'LazySelect',
                ],
                'DateTime',
                [
                  'DatePicker',
                  'DateTimePicker',
                  'YearMonthPicker',
                ],
                'ColorPicker',
                'MultiAssigner',
              ],
              'tables',
              [
                'DataTable',
              ],
              'navigation',
              [
                'Switcher',
                'Tabs',
                'TabEmbedded',
              ],
              'layout',
              [
                'Breadcrumbs',
                'headers',
                [
                  'HeaderGrid',
                ],
                'sidebars',
                [
                  'Nav',
                  'Sidebar',
                ],
                'layouts',
                [
                  'Layout',
                ],
              ],
              'internal',
              [
                'CloseButton',
              ],
            ],
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
        const [theme, setTheme] = useState<'light' | 'dark'>(() => {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        });
        
        useEffect(() => {
          const controller = new AbortController();
          
          const media = window.matchMedia('(prefers-color-scheme: dark)');
          media.addEventListener('change', event => {
            setTheme(event.matches ? 'dark' : 'light');
          }, { signal: controller.signal });
          
          return () => { controller.abort(); };
        }, []);
        
        return (
          <DocsContainer {...props} theme={themes[theme]}/>
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
    
    darkMode: {
      lightClass: 'bk-theme--light',
      darkClass: 'bk-theme--dark',
      classTarget: 'html',
      stylePreview: true,
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
