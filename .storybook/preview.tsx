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



const channel = addons.getChannel();
const preview = {
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
            'Change log',
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
            ],
            'text',
            [
              'Tag',
            ],
            'containers',
            [
              'Panel',
              'Card',
              'Alert',
              'Dialog',
            ],
            'actions',
            [
              'Link',
              'LinkAsButton',
              'Button',
              'ButtonAsLink',
              'Switcher',
            ],
            'overlays',
            [
              'Tooltip',
              'TooltipProvider',
              'Dropdown',
              'Modal',
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
              ],
              'controls',
              [
                'Checkbox',
                'CheckboxGroup',
                'Switch',
                'Input',
                'Select',
              ],
              'fields',
              [
                'Input',
              ],
            ],
            'navigations',
            [
              'Tabs',
            ],
          ],
          'layouts',
          [
            'FormLayout',
            'AppLayout',
            [
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
  },
} satisfies Preview;

export default preview;
