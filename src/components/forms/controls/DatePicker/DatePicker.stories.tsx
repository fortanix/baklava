/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { DatePicker } from './DatePicker.tsx';


type DatePickerArgs = React.ComponentProps<typeof DatePicker>;
type Story = StoryObj<DatePickerArgs>;

export default {
  // TODO: Why this error???
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
          // TODO: why this error? selected is defined as Date | null on
          // node_modules/react-datepicker/dist/index.d.ts, line 67
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
        />
      </div>
    );
  }
};

export const DatePickerStoryWithRange: Story = {
  name: 'Date Picker with Dates Range',
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date());
    const [endDate, setEndDate] = React.useState<Date | null>(new Date());
    const onChange = (dates: (Date | null)[]) => {
      let [start, end] = dates;
      // TODO: should I make sure start and end are not undefined in a different way?
      // apparently linter thinks they can be undefined because of the destructuring.
      if (start !== undefined && end !== undefined) {
        setStartDate(start);
        setEndDate(end);
      }
    };

    return (
      <div style={{height: '500px'}}>
        <DatePicker
          {...args}
          // TODO: same error as previous story
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange={true}
          inline={true}
        />
      </div>
    );

    // const [startDate, setStartDate] = React.useState(new Date());
    // const [endDate, setEndDate] = React.useState(null);
    // const onChange = (dates: any) => {
    //   const [start, end] = dates;
    //   setStartDate(start);
    //   setEndDate(end);
    // };
    // return (
    //   <DatePicker
    //     selected={startDate}
    //     onChange={onChange}
    //     startDate={startDate}
    //     endDate={endDate}
    //     selectsRange
    //     inline
    //   />
    // );
  }
};
