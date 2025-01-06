/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { DateTimePicker } from './DateTimePicker.tsx';


type DateTimePickerArgs = React.ComponentProps<typeof DateTimePicker>;
type Story = StoryObj<DateTimePickerArgs>;

export default {
  component: DateTimePicker,
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
} satisfies Meta<DateTimePickerArgs>;

export const Standard: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date(2024, 10, 12, 9, 41));

    return (
      // with a fixed height to avoid hiding the bottom part of the calendar
      <div style={{height: '500px'}}>
        <DateTimePicker
          {...args}
          date={date}
          onChange={(date: Date | null) => setDate(date)}
        />
        <p>Date selected: {date?.toDateString()} - {date?.toTimeString()}</p>
      </div>
    );
  }
};
