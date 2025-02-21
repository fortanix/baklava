/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { InputSensitive } from './InputSensitive.tsx';


type InputSensitiveArgs = React.ComponentProps<typeof InputSensitive>;
type Story = StoryObj<InputSensitiveArgs>;

export default {
  component: InputSensitive,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    placeholder: 'Sensitive input',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <InputSensitive {...args}/>,
} satisfies Meta<InputSensitiveArgs>;


export const InputSensitiveStandard: Story = {};

export const InputSensitiveWithoutVisibilityToggle: Story = {
  args: {
    allowReveal: false,
    defaultValue: 'example$input',
  },
};

export const InputSensitiveWithTypeNumber: Story = {
  args: {
    placeholder: 'Sensitive number',
    type: 'number',
  },
};
