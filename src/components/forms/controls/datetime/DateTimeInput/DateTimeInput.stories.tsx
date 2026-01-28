/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateTimeInput } from './DateTimeInput.tsx';


type DateTimeInputArgs = React.ComponentProps<typeof DateTimeInput>;
type Story = StoryObj<DateTimeInputArgs>;

export default {
  component: DateTimeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <DateTimeInput {...args}/>,
} satisfies Meta<DateTimeInputArgs>;

const DateTimeInputControlledDec = ({ defaultDateTime, ...props }: DateTimeInputArgs) => {
  const [dateTime, setDateTime] = React.useState<null | Date>(defaultDateTime ?? null);
  
  return (
    <form onSubmit={event => { event.preventDefault(); }}>
      <DateTimeInput {...props} dateTime={dateTime} onUpdateDateTime={setDateTime}/>
      <p>
        The selected date/time is: {dateTime === null ? '(empty)' : <time>{dateTime.toISOString()}</time>}
      </p>
    </form>
  );
};


export const DateTimeInputStandard: Story = {
  decorators: [(_, { args }) => <DateTimeInputControlledDec {...args}/>],
  args: {
    defaultDateTime: new Date('2024-04-19'),
  },
};

export const DateTimeInputEmpty: Story = {
  decorators: [(_, { args }) => <DateTimeInputControlledDec {...args}/>],
};
