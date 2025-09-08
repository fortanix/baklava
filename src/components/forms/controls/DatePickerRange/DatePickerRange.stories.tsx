/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { DatePickerRange } from './DatePickerRange.tsx';


type DatePickerRangeArgs = React.ComponentProps<typeof DatePickerRange>;
type Story = StoryObj<DatePickerRangeArgs>;

const meta: Meta<DatePickerRangeArgs> = { // Need an explicit type annotation here for TS declaration emission
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
};
export default meta;

export const Standard: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date(2024, 10, 12, 9, 41));
    const [endDate, setEndDate] = React.useState<Date | null>(new Date(2024, 10, 14, 9, 41));
    const onChange = (dates: [Date | null, Date | null]) => {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    };

    return (
      // with a fixed height to avoid hiding the bottom part of the calendar
      <div style={{ blockSize: 500 }}>
        <DatePickerRange
          {...args}
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          inline={true}
        />
        {/* with a fixed width to avoid content moving around while selecting */}
        <p style={{ inlineSize: 300 }}>
          Range selected:<br />
          {startDate?.toDateString()} - {endDate === null && '(null)'}{endDate?.toDateString()}
        </p>
      </div>
    );
  }
};
