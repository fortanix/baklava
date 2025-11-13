/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../../util/storybook/LayoutDecorator.tsx';

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
    date: new Date('2024-04-19'),
  },
};

export const DateInputEmpty: Story = {
  decorators: [(_, { args }) => <DateInputStory {...args}/>],
  args: {
    date: null,
  },
};
