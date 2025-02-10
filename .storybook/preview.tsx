/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './preview.scss'; // Note: must be imported before any other CSS for `@layer` to work
import 'virtual:svg-icons-register';

import * as React from 'react';

import { type Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME, UPDATE_DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { DocsContainer, Title, Subtitle, Description, Primary, Controls, Stories } from '@storybook/blocks';

import { BaklavaProvider } from '../src/context/BaklavaProvider.tsx';


const channel = addons.getChannel();
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
            'BodyText',
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
              'DropdownMenu',
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
              'controls',
              [
                'Checkbox',
                'Switch',
                'Radio',
                'SegmentedControl',
                'Input',
                [
                  'InputSearch',
                  'InputSensitive',
                  'InputPassword',
                ],
                'TextArea',
                'Select',
                'DatePicker',
                'DatePickerRange',
                'TimePicker',
                'DateTimePicker',
              ],
              'fields',
              [
                'CheckboxGroup',
                'CheckboxField',
                'RadioGroup',
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
            'AppLayout',
            [
              'Logo',
              'Header',
              'Nav',
              'Sidebar',
              'Breadcrumbs',
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
      container: (props) => {
        // `DocsContainer` does not automatically support light/dark mode switching, need to set the theme manually
        const [isDark, setDark] = React.useState();
        //const onChangeHandler = () => { channel.emit(UPDATE_DARK_MODE_EVENT_NAME); };
        
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
          //{ id: 'color-contrast', selector: '*:not(button[class*=primary])' },
        ],
      },
      // Axe's options parameter
      options: {},
    },
  },
} satisfies Preview;

export default preview;
