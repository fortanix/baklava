/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../../util/storybook/LayoutDecorator.tsx';
import { SubmitButton } from '../../../../../util/storybook/SubmitButton.tsx';
import { notify } from '../../../../overlays/ToastProvider/ToastProvider.tsx';

import { type TimeInputValue, TimeInput } from './TimeInput.tsx';


type TimeInputArgs = React.ComponentProps<typeof TimeInput>;
type Story = StoryObj<TimeInputArgs>;

export default {
  component: TimeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <LayoutDecorator size="x-small">
        <style>{`@scope { form { display: flex; align-items: center; flex-direction: column; gap: 0.6lh; } }`}</style>
        <Story/>
      </LayoutDecorator>
    ),
  ],
  argTypes: {},
  args: {},
} satisfies Meta<TimeInputArgs>;

const TimeInputControlledDec = ({ defaultTime, ...props }: TimeInputArgs) => {
  const [time, setTime] = React.useState<null | TimeInputValue>(defaultTime ?? null);
  
  return (
    <form onSubmit={event => { event.preventDefault(); }}>
      <TimeInput aria-label="Example time input" {...props} time={time} onUpdateTime={setTime}/>
      <p>
        The selected time is: <time>{time === null ? '(empty)' : TimeInput.formatTime(time)}</time>
      </p>
    </form>
  );
};

export const TimeInputStandard: Story = {
  decorators: [(_, { args }) => <TimeInputControlledDec {...args}/>],
  args: {
    defaultTime: { hours: 9, minutes: 42 },
  },
};

export const TimeInputEmpty: Story = {
  decorators: [(_, { args }) => <TimeInputControlledDec {...args}/>],
  args: {
    defaultTime: null,
  },
};

const TimeInputUncontrolledDec = (props: TimeInputArgs) => {
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        notify.success(`Time: ${formData.get('story_component') || '(empty)'}`);
      }}
    >
      <TimeInput aria-label="Example time input" {...props} name="story_component"/>
      <SubmitButton label="Submit"/>
    </form>
  );
};

export const TimeInputUncontrolled: Story = {
  decorators: [(_, { args }) => <TimeInputUncontrolledDec {...args}/>],
  args: {
    time: undefined,
    onTimeUpdate: undefined,
  },
};

export const TimeInputUncontrolledWithDefault: Story = {
  decorators: [(_, { args }) => <TimeInputUncontrolledDec {...args}/>],
  args: {
    time: undefined,
    defaultTime: { hours: 23, minutes: 59 },
    onTimeUpdate: undefined,
  },
};
