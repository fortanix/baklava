/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { YearMonthPicker } from './YearMonthPicker.tsx';


type YearMonthPickerArgs = React.ComponentProps<typeof YearMonthPicker>;
type Story = StoryObj<YearMonthPickerArgs>;

export default {
  component: YearMonthPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <YearMonthPicker {...args}/>,
} satisfies Meta<YearMonthPickerArgs>;


export const YearMonthPickerStandard: Story = {
  args: {
    selectedDate: { month: 2, year: 1990 },
    mode: 'previous',
    setMode: mode => {},
    onChange: (buffer, mode) => {},
  },
};
