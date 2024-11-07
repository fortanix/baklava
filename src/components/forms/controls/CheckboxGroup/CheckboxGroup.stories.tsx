/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxGroup } from './CheckboxGroup.tsx';


type CheckboxGroupArgs = React.ComponentProps<typeof CheckboxGroup>;
type Story = StoryObj<CheckboxGroupArgs>;

export default {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    items: [
      {
        label: 'Label 1',
        checked: true,
        value: 'label1',
      },
      {
        label: 'Label 2',
        checked: false,
        value: 'label2',
      },
      {
        label: 'Label 3',
        checked: false,
        value: 'label3',
      },
    ],
    handleChange: (options: boolean[]) => console.log(options),
  },
  argTypes: {
  },
  render: (args) => <CheckboxGroup {...args} />,
} satisfies Meta<CheckboxGroupArgs>;

export const CheckboxGroupVertical: Story = {};

export const CheckboxGroupHorizontal: Story = {
  args: {
    direction: 'horizontal',
  },
};
