/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToggleButton } from './ToggleButton.tsx';


type ToggleButtonArgs = React.ComponentProps<typeof ToggleButton>;
type Story = StoryObj<ToggleButtonArgs>;

export default {
  component: ToggleButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Toggle me',
  },
  render: (args) => <ToggleButton {...args}/>,
} satisfies Meta<ToggleButtonArgs>;


export const ToggleButtonStandard: Story = {};

export const ToggleButtonNonactive: Story = {
  args: { nonactive: true },
};

export const ToggleButtonDisabled: Story = {
  args: { disabled: true },
};

export const ToggleButtonWithIcon: Story = {
  args: { icon: 'account' },
};
