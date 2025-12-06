/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../../util/storybook/LayoutDecorator.tsx';
import { SubmitButton } from '../../../../../util/storybook/SubmitButton.tsx';

import { notify } from '../../../../overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../../../../actions/Button/Button.tsx';

import { DateInput } from './DateInput.tsx';


type DateInputArgs = React.ComponentProps<typeof DateInput>;
type Story = StoryObj<DateInputArgs>;

export default {
  component: DateInput,
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
            &, form {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5lh;
            }
          }
        `}</style>
        <Story/>
        <p><Button label="Focus target"/></p>
      </LayoutDecorator>
    ),
  ],
} satisfies Meta<DateInputArgs>;

const DateInputStory = (props: DateInputArgs) => {
  const { defaultDate, ...propsRest } = props;
  
  const [date, setDate] = React.useState<null | Date>(defaultDate ?? null);
  return (
    <form onSubmit={event => { event.preventDefault(); }}>
      <DateInput {...propsRest} date={date} onUpdateDate={setDate} />
      <p>Selected date: {date?.toDateString() ?? '(none)'}</p>
    </form>
  );
};

export const DateInputStandard: Story = {
  decorators: [(_, { args }) => <DateInputStory {...args}/>],
  args: {
    defaultDate: new Date('2024-04-19'),
  },
};

/** Add an action, to test that focus of other interactive elements still trigger the popover. */
export const DateInputWithAction: Story = {
  decorators: [(_, { args }) => <DateInputStory {...args}/>],
  args: {
    defaultDate: new Date('2024-04-19'),
    actions: <DateInput.Action icon="bell" label="Bell" onPress={() => { notify.info('Click'); }}/>,
  },
};

export const DateInputEmpty: Story = {
  decorators: [(_, { args }) => <DateInputStory {...args}/>],
  args: {
    defaultDate: null,
  },
};

const DateInputUncontrolledDec = (props: DateInputArgs) => {
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        notify.success(`Date: ${formData.get('story_component') || '(empty)'}`);
      }}
    >
      <DateInput {...props} name="story_component"/>
      <SubmitButton label="Submit"/>
    </form>
  );
};

export const DateInputUncontrolled: Story = {
  decorators: [(_, { args }) => <DateInputUncontrolledDec {...args}/>],
  args: {
    date: undefined,
    onUpdateDate: undefined,
  },
};

export const DateInputUncontrolledWithDefault: Story = {
  decorators: [(_, { args }) => <DateInputUncontrolledDec {...args}/>],
  args: {
    date: undefined,
    defaultDate: new Date('2024-04-19'),
    onUpdateDate: undefined,
  },
};
