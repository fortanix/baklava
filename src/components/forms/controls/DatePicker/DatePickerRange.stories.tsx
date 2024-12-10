/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { DatePickerRange } from './DatePickerRange.tsx';


type DatePickerRangeArgs = React.ComponentProps<typeof DatePickerRange>;
type Story = StoryObj<DatePickerRangeArgs>;

export default {
  component: DatePickerRange,
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
} satisfies Meta<DatePickerRangeArgs>;

export const DatePickerRangeStory: Story = {
  name: 'Date Picker with Dates Range',
  render: (args) => {
    const [startDate, setStartDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date());
    const onChange = (dates: [Date, Date]) => {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    };

    return (
      // with a fixed height to avoid hiding the bottom part of the calendar
      <div style={{height: '500px'}}>
        <DatePickerRange
          {...args}
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          inline={true}
        />
        {/* with a fixed width to avoid content moving around while selecting */}
        <p style={{width: '300px'}}>
          Range selected:<br />
          {startDate?.toDateString()} - {endDate?.toDateString()}
        </p>
      </div>
    );
  }
};
