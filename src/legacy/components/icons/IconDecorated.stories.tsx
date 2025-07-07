/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { IconDecorated } from './IconDecorated.tsx';


type IconDecoratedArgs = React.ComponentProps<typeof IconDecorated>;
type Story = StoryObj<IconDecoratedArgs>;

export default {
  component: IconDecorated,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    name: 'account',
  },
  render: (args) => <IconDecorated {...args}/>,
} satisfies Meta<IconDecoratedArgs>;


export const IconDecoratedWithHighlight: Story = {
  args: {
    decorations: ['highlight'],
  },
};

export const IconDecoratedWithBackgroundCircle: Story = {
  args: {
    decorations: ['background-circle'],
    style: { background: 'forestgreen' },
  },
};

export const IconDecoratedWithBorderCircle: Story = {
  args: {
    decorations: ['border-circle'],
  },
};
