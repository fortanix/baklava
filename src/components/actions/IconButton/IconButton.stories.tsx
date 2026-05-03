/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { IconButton } from './IconButton.tsx';


type IconButtonArgs = React.ComponentProps<typeof IconButton>;
type Story = StoryObj<IconButtonArgs>;

export default {
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Visible',
    icon: 'eye-open',
    onPress: () => { notify.info(`You clicked the icon button`); },
  },
  render: (args) => <IconButton {...args}/>,
} satisfies Meta<IconButtonArgs>;


export const IconButtonStandard: Story = {};

export const IconButtonIsolation: Story = {
  decorators: [
    Story => (
      <p className="bk-prosex" style={{ fontSize: '2em', color: 'red', lineHeight: 2 }}>
        The following <code>IconButton</code> should NOT be styled:
        {' '}
        <Story/>
        {' '}
        It should have the default color and normal font size.
      </p>
    ),
  ],
};

export const IconButtonInline: Story = {
  decorators: [
    Story => (
      <>
        <p style={{ fontSize: '2em', color: 'red', lineHeight: 2 }}>
          The following <code className="bk-prose">IconButton</code> SHOULD be styled:
          {' '}
          <Story/>
          {' '}
          It should have the same color and font size as the rest of the paragraph.
        </p>
        <p className="bk-prose" style={{ fontSize: '2em', color: 'purple', lineHeight: 2 }}>
          Here is an <code>IconButton</code> within prose: <Story/>.
          {' '}
          It should have the same color and font size as the rest of the paragraph.
        </p>
      </>
    ),
  ],
  args: {
    inline: true,
  },
};
