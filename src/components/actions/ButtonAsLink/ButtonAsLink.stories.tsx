/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { ButtonAsLink } from './ButtonAsLink.tsx';


type ButtonAsLinkArgs = React.ComponentProps<typeof ButtonAsLink>;
type Story = StoryObj<typeof ButtonAsLink>;

export default {
  component: ButtonAsLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    label: 'Button',
    onPress: () => { notify.success('You pressed the button.'); },
  },
  render: (args) => <ButtonAsLink {...args}/>,
} satisfies Meta<ButtonAsLinkArgs>;


export const Standard: Story = {};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

/** ButtonAsLink should have vertical alignment matching other inline text. */
export const Inline: Story = {
  args: {
    label: 'ButtonAsLink',
  },
  render: args => (
    <p style={{ fontSize: '14px', textDecoration: 'underline' }}>
      Here is some text with a <ButtonAsLink {...args}/> embedded. It should have the matching font size and vertical alignment. The underline should match exactly.
    </p>
  )
};
