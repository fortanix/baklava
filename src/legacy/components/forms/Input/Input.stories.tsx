/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input.tsx';


type InputArgs = React.ComponentProps<typeof Input>;
type Story = StoryObj<InputArgs>;

export default {
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <Input {...args}/>,
} satisfies Meta<InputArgs>;


export const InputStandard: Story = {};

export const InputWithPlaceholder: Story = {
  args: {
    placeholder: 'Some placeholder',
  }
};

export const InputWithText: Story = {
  args: {
    defaultValue: 'Text input',
  },
};

export const InputWithFocus: Story = {
  args: {
    autoFocus: true,
    defaultValue: 'Text input',
  },
};

export const InputDisabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'I should be disabled',
  },
};

export const InputWithTypeNumber: Story = { args: { type: 'number', defaultValue: '123' } };
export const InputWithTypePassword: Story = { args: { type: 'password', defaultValue: 'some-password' } };

export const InputWithVisibilityToggle: Story = {
  args: {
    toggleVisibility: true,
    defaultValue: 'This input value should be masked by default',
  },
};

const InputControlledC = (props: React.ComponentProps<typeof Input>) => {
  const [value, setValue] = React.useState(props.defaultValue);
  
  return (
    <>
      <p>Value: {value}</p>
      <Input {...props} value={value} onChange={event => { setValue(event.target.value); }}/>
    </>
  );
};
export const InputControlled: Story = {
  args: {
    defaultValue: 'Controlled input',
  },
  render: args => <InputControlledC {...args}/>,
};
