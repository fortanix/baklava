/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { InputPassword } from './InputPassword.tsx';


type InputPasswordArgs = React.ComponentProps<typeof InputPassword>;
type Story = StoryObj<InputPasswordArgs>;

export default {
  component: InputPassword,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <InputPassword {...args}/>,
} satisfies Meta<InputPasswordArgs>;


export const InputPasswordStandard: Story = {};
