/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { DatePicker } from './DatePicker.tsx';


type DatePickerArgs = React.ComponentProps<typeof DatePicker>;
type Story = StoryObj<DatePickerArgs>;

export default {
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {},
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
} satisfies Meta<DatePickerArgs>;

export const DatePickerStory: Story = {
  name: 'Date Picker',
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date());

    return (
      <div style={{height: '500px'}}>
        <DatePicker
          {...args}
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
        />
      </div>
    );
  }
};
