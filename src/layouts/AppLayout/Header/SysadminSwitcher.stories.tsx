/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { SysadminSwitcher } from './SysadminSwitcher.tsx';


type SysadminSwitcherArgs = React.ComponentProps<typeof SysadminSwitcher>;
type Story = StoryObj<SysadminSwitcherArgs>;

export default {
  component: SysadminSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    title: 'System Administration',
  },
  render: (args) => <SysadminSwitcher {...args}/>,
} satisfies Meta<SysadminSwitcherArgs>;


export const SysadminSwitcherStandard: Story = {};

export const SysadminSwitcherWithSubtitle: Story = {
  args: {
    subtitle: 'Some subtitle',
  },
};
