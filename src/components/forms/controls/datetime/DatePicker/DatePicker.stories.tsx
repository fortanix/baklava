/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../../util/storybook/LayoutDecorator.tsx';

import { DatePicker } from './DatePicker.tsx';


type DatePickerArgs = React.ComponentProps<typeof DatePicker>;
type Story = StoryObj<DatePickerArgs>;

const DatePickerControlled = (props: Omit<React.ComponentProps<typeof DatePicker>, 'onChange'>) => {
  const { selected: selectedDateInitial, ...propsRest } = props;
  
  const [selectedDate, setSelectedDate] = React.useState<null | Date>(selectedDateInitial);
  
  return (
    <>
      <DatePicker {...propsRest} selected={selectedDate} onChange={setSelectedDate} />
      <p>Selected date: {selectedDate?.toDateString() ?? '(none)'}</p>
    </>
  );
};

export default {
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <DatePickerControlled {...args}/>,
  decorators: [
    Story => (
      <form onSubmit={event => { event.preventDefault(); }}>
        <LayoutDecorator size="x-small">
          <style>{`
            @scope {
              display: flex;
              flexDirection: column;
              align-items: center;
              gap: 0.5lh;
            }
          `}</style>
          <Story/>
        </LayoutDecorator>
      </form>
    ),
  ],
} satisfies Meta<DatePickerArgs>;


export const DatePickerStandard: Story = {
  args: {
    selected: new Date('2024-04-19'),
  },
};

export const DatePickerEmpty: Story = {
  args: {
    selected: null,
    // Use a fixed `openToDate` to make the visual tests consistent (rather than using the current date)
    openToDate: new Date('2024-04-19'),
  },
};
