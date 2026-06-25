/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dot } from './Dot.tsx';


type DotArgs = React.ComponentProps<typeof Dot>;
type Story = StoryObj<typeof Dot>;

export default {
  component: Dot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => <Dot {...args}/>,
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Dot</div>,
  ],
} satisfies Meta<DotArgs>;


export const DotStandard: Story = {};

export const DotAlert: Story = {
  args: {
    event: 'alert',
  }
};

export const DotInformational: Story = {
  args: {
    event: 'informational',
  }
};

export const DotWarning: Story = {
  args: {
    event: 'warning',
  }
};
