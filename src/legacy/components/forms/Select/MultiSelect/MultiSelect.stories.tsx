/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { MultiSelect } from './MultiSelect.tsx';


type MultiSelectArgs = React.ComponentProps<typeof MultiSelect>;
type Story = StoryObj<MultiSelectArgs>;

export default {
  component: MultiSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <MultiSelect {...args}/>,
} satisfies Meta<MultiSelectArgs>;


const options1 = {
  apple: { label: 'Apple' },
  banana: { label: 'Banana' },
  cherry: { label: 'Cherry', disabled: true },
  durian: { label: 'Durian' },
};

export const MultiSelectStandard: Story = {
  args: {
    options: options1,
    selectedValues: ['banana', 'durian'],
  },
};

export const MultiSelectWithScroll: Story = {
  decorators: [
    Story => (
      <div style={{ paddingTop: 1000 }}>
        <Story/>
      </div>
    ),
  ],
  args: {
    options: options1,
    selectedValues: ['banana', 'durian'],
  },
};
