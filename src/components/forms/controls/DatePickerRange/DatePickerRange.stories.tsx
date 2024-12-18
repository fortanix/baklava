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

export const Standard: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date(2024, 11, 12, 9, 41));
    const [endDate, setEndDate] = React.useState<Date | null>(new Date(2024, 11, 14, 9, 41));
    const onChange = (dates: [Date | null, Date | null]) => {
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
          // There is a bug for startDate and endDate on the original library;
          // it was already merged to master, but not released yet.
          // https://github.com/Hacker0x01/react-datepicker/pull/5260
          // biome-ignore lint/suspicious/noExplicitAny: bug in library, see above
          startDate={startDate as any}
          // biome-ignore lint/suspicious/noExplicitAny: bug in library, see above
          endDate={endDate as any}
          inline={true}
        />
        {/* with a fixed width to avoid content moving around while selecting */}
        <p style={{width: '300px'}}>
          Range selected:<br />
          {startDate?.toDateString()} - {endDate === null && '(null)'}{endDate?.toDateString()}
        </p>
      </div>
    );
  }
};
