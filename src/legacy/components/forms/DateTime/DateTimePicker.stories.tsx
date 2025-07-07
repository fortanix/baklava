/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { DateTimePicker } from './DateTimePicker.tsx';


type DateTimePickerArgs = React.ComponentProps<typeof DateTimePicker>;
type Story = StoryObj<DateTimePickerArgs>;

export default {
  component: DateTimePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <DateTimePicker {...args}/>,
} satisfies Meta<DateTimePickerArgs>;


export const DateTimePickerStandard: Story = {
  args: {
    dateTime: new Date(),
    onChange: () => {},
  },
};
