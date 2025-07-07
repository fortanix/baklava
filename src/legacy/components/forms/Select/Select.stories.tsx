/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Select } from './Select.tsx';


type SelectArgs = React.ComponentProps<typeof Select>;
type Story = StoryObj<SelectArgs>;

const SelectControlledC = (props: React.ComponentProps<typeof Select>) => {
  const [value, setValue] = React.useState(props.value);
  return <Select {...props} value={value} onSelect={setValue}/>;
};

export default {
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <SelectControlledC {...args}/>,
} satisfies Meta<SelectArgs>;


const options1 = {
  apple: { label: 'Apple' },
  banana: { label: 'Banana' },
  cherry: { label: 'Cherry', disabled: true },
  durian: { label: 'Durian' },
};

export const SelectStandard: Story = {
  args: {
    placeholder: 'Select a fruit',
    defaultOption: { label: 'Fruits' },
    options: options1,
  },
};

export const SelectEmpty: Story = {
  args: {
    options: {},
    placeholder: 'An empty select',
    defaultOption: { label: 'Select an option' },
  },
};
