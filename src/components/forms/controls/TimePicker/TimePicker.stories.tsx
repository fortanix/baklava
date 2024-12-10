/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { TimePicker } from './TimePicker.tsx';


type TimePickerArgs = React.ComponentProps<typeof TimePicker>;
type Story = StoryObj<TimePickerArgs>;

export default {
  component: TimePicker,
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
} satisfies Meta<TimePickerArgs>;

export const TimePickerStory: Story = {
  name: 'Time Picker',
  render: (args) => {
    const [time, setTime] = React.useState<string>(`${new Date().getHours()}:${new Date().getMinutes()}`);

    return (
      <div>
        <TimePicker time={time} onUpdate={setTime}/>
        <p>
          The selected time is: {time}
        </p>
      </div>
    );
  }
};
