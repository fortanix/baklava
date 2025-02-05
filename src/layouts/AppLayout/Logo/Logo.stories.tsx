/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Logo } from './Logo.tsx';


type LogoArgs = React.ComponentProps<typeof Logo>;
type Story = StoryObj<LogoArgs>;

export default {
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    subtitle: 'Data Security Manager',
    subtitleTrademark: true,
  },
  render: (args) => <Logo {...args}/>,
} satisfies Meta<LogoArgs>;


export const Standard: Story = {
  name: 'Logo',
  args: {
    style: { outline: '1px solid firebrick' },
  },
};
