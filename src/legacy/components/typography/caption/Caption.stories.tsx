/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Caption } from './Caption.tsx';


type CaptionArgs = React.ComponentProps<typeof Caption>;
type Story = StoryObj<CaptionArgs>;

export default {
  component: Caption,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Caption',
  },
  render: (args) => <Caption {...args}/>,
} satisfies Meta<CaptionArgs>;


export const CaptionStandard: Story = {};

export const CaptionSmall: Story = {
  args: { size: 'small', children: 'Small caption' },
};
