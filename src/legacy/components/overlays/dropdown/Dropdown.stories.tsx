/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown } from './Dropdown.tsx';


type DropdownArgs = React.ComponentProps<typeof Dropdown>;
type Story = StoryObj<DropdownArgs>;

export default {
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Dropdown {...args}/>,
} satisfies Meta<DropdownArgs>;


export const DropdownStandard: Story = {};

export const DropdownWithVariant: Story = {
  args: {
    variant: 'x',
  },
};
