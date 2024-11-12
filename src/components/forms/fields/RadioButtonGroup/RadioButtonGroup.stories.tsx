/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { RadioButtonGroup } from './RadioButtonGroup.tsx';


type RadioButtonGroupArgs = React.ComponentProps<typeof RadioButtonGroup>;
type Story = StoryObj<RadioButtonGroupArgs>;

export default {
  component: RadioButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => <RadioButtonGroup {...args}>
    <RadioButtonGroup.RadioButtonField label='Label'/>
    <RadioButtonGroup.RadioButtonField label='Label'/>
    <RadioButtonGroup.RadioButtonField label='Label'/>
  </RadioButtonGroup>,
} satisfies Meta<RadioButtonGroupArgs>;

export const RadioButtonGroupVertical: Story = {};

export const RadioButtonGroupHorizontal: Story = {
  args: {
    direction: 'horizontal',
  },
};
