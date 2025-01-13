/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Select } from './Select.tsx';


type SelectArgs = React.ComponentProps<typeof Select>;
type Story = StoryObj<SelectArgs>;

export default {
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <Select {...args}/>,
} satisfies Meta<SelectArgs>;


export const Standard: Story = {
  name: 'Select',
  args: {
    children: (
      <>
        <Select.Option optionKey="option-1" label="Option 1"/>
        <Select.Option optionKey="option-2" label="Option 2"/>
        <Select.Option optionKey="option-3" label="Option 3"/>
        {/* <Select.Option optionKey="option-4" label="Option 4"/>
        <Select.Option optionKey="option-5" label="Option 5"/>
        <Select.Option optionKey="option-6" label="Option 6"/>
        <Select.Option optionKey="option-7" label="Option 7"/>
        <Select.Option optionKey="option-8" label="Option 8"/> */}
      </>
    ),
  },
};
