/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { delay } from '../../../../util/time.ts';

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, fireEvent, within } from '@storybook/test';

import * as React from 'react';

import { Input } from './Input.tsx';


type InputArgs = React.ComponentProps<typeof Input>;
type Story = StoryObj<InputArgs>;

export default {
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    placeholder: 'Example',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Input {...args}/>,
} satisfies Meta<InputArgs>;


export const Standard: Story = {
};

export const InvalidInput: Story = {
  args: {
    required: true,
    pattern: '\d+',
    className: 'invalid',
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Example');
    await delay(100);
    await userEvent.type(input, 'invalid');
    await delay(100);
    await userEvent.keyboard('{Enter}');
    await fireEvent.submit(input.closest('form')!);
    await userEvent.click(input.closest('form')!);
  },  
};
