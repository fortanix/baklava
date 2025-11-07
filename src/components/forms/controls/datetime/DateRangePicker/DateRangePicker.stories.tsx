/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../../util/storybook/LayoutDecorator.tsx';

import { type DateRange, DateRangePicker } from './DateRangePicker.tsx';


type DateRangePickerArgs = React.ComponentProps<typeof DateRangePicker>;
type Story = StoryObj<DateRangePickerArgs>;

export default {
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  decorators: [
    Story => (
      <LayoutDecorator size="x-small">
        <style>{`
          @scope {
            form {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5lh;
            }
          }
        `}</style>
        <Story/>
      </LayoutDecorator>
    ),
  ],
} satisfies Meta<DateRangePickerArgs>;

const DateRangePickerStory = (props: DateRangePickerArgs) => {
  const { selected: selectedRangeInitial, ...propsRest } = props;
  
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(selectedRangeInitial ?? [null, null]);
  const [startDate, endDate] = selectedRange;
  
  return (
    <form onSubmit={event => { event.preventDefault(); }}>
      <DateRangePicker {...propsRest} selected={selectedRange} onChange={setSelectedRange} />
      <p>Start: {startDate?.toDateString() ?? '(none)'}</p>
      <p>End: {endDate?.toDateString() ?? '(none)'}</p>
    </form>
  );
};

export const DateRangePickerStandard: Story = {
  decorators: [(_, { args }) => <DateRangePickerStory {...args}/>],
  args: {
    selected: [new Date('2024-04-19'), new Date('2024-04-28')],
  },
};

export const DateRangePickerEmpty: Story = {
  decorators: [(_, { args }) => <DateRangePickerStory {...args}/>],
  args: {
    selected: [null, null],
  },
};
