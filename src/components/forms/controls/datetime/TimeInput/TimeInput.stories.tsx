/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Time, TimeInput } from './TimeInput.tsx';


type TimeInputArgs = React.ComponentProps<typeof TimeInput>;
type Story = StoryObj<TimeInputArgs>;

export default {
  component: TimeInput,
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
} satisfies Meta<TimeInputArgs>;

const TimeInputStory = (props: TimeInputArgs) => {
  const [time, setTime] = React.useState<null | Time>(props.time);
  
  const formatTime = (time: Time) =>
    `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
  
  return (
    <div>
      <TimeInput aria-label="Example time input" time={time} onUpdate={setTime}/>
      <p>
        The selected time is: <time>{time === null ? '(empty)' : formatTime(time)}</time>
      </p>
    </div>
  );
};

export const TimeInputStandard: Story = {
  decorators: [
    (_, { args }) => <TimeInputStory {...args}/>,
  ],
  args: {
    time: { hours: 9, minutes: 42 },
  },
};

export const TimeInputEmpty: Story = {
  decorators: [
    (_, { args }) => <TimeInputStory {...args}/>,
  ],
  args: {
    time: null,
  },
};
