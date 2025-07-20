/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input.tsx';


type InputArgs = React.ComponentProps<typeof Input>;
type Story = StoryObj<InputArgs>;

export default {
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    defaultValue: 'Example',
  },
  render: (args) => <Input {...args}/>,
} satisfies Meta<InputArgs>;


export const InputStandard: Story = {};
