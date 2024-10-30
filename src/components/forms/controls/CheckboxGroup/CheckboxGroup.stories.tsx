/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxGroup } from './CheckboxGroup.tsx';
import { CheckboxField } from '../CheckboxField/CheckboxField.tsx';


type CheckboxGroupArgs = React.ComponentProps<typeof CheckboxGroup>;
type Story = StoryObj<CheckboxGroupArgs>;

export default {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => <CheckboxGroup {...args}>
    <CheckboxField label='Label'/>
    <CheckboxField label='Label'/>
    <CheckboxField label='Label'/>
  </CheckboxGroup>,
} satisfies Meta<CheckboxGroupArgs>;

export const CheckboxGroupVertical: Story = {};

export const CheckboxGroupHorizontal: Story = {
  args: {
    alignment: 'horizontal',
  },
};
