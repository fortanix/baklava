/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateInput } from './DateInput.tsx';


type DateInputArgs = React.ComponentProps<typeof DateInput>;
type Story = StoryObj<DateInputArgs>;

export default {
  component: DateInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <DateInput {...args}/>,
} satisfies Meta<DateInputArgs>;


export const DateInputStandard: Story = {};
