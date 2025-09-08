/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './preview.scss'; // Note: must be imported before any other CSS for `@layer` to work
import 'virtual:svg-icons-register';

import * as React from 'react';

import { type Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';
import { addons } from 'storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from '@storybook-community/storybook-dark-mode';
import { DocsContainer } from '@storybook/addon-docs/blocks';

import { BaklavaProvider } from '../src/context/BaklavaProvider.tsx';


const channel = addons.getChannel();

// Start listening to dark mode events as soon as possible. In Safari it seems the event is emitted *before*
// the component is first rendered and starts listening to this event.
// Ticket: https://github.com/hipstersmoothie/@storybook-community/storybook-dark-mode/issues/230
let isDarkInitial = false;
channel.on(DARK_MODE_EVENT_NAME, isDark => { isDarkInitial = isDark; });


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
                'ComboBox',
                'Select',
                'SelectMulti',
                'DatePicker',
                'DatePickerRange',
                'TimePicker',
                'DateTimePicker',
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
      container: (props) => {
        // `DocsContainer` does not automatically support light/dark mode switching, need to set the theme manually
        const [isDark, setDark] = React.useState(isDarkInitial);
        
        React.useEffect(() => {
          channel.on(DARK_MODE_EVENT_NAME, setDark);
          return () => channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
        }, [channel, setDark]);
        
        const theme = React.useMemo(() => isDark ? themes.dark : themes.light, [isDark]);
        return (
          <DocsContainer {...props} theme={theme}/>
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
          { id: 'color-contrast', enabled: false, selector: '*' },
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
