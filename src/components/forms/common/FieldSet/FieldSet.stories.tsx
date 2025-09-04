/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '../../controls/Checkbox/Checkbox.tsx';

import { FieldSet } from './FieldSet.tsx';


type FieldSetArgs = React.ComponentProps<typeof FieldSet>;
type Story = StoryObj<FieldSetArgs>;

export default {
  component: FieldSet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    legend: 'Field set legend:',
    children: (
      <>
        <Checkbox.Labeled label="Control 1"/>
        <Checkbox.Labeled label="Control 2"/>
      </>
    ),
  },
  render: (args) => <FieldSet {...args}/>,
} satisfies Meta<FieldSetArgs>;


export const FieldSetStandard: Story = {};

export const FieldSetHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    children: (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5ch' }}>
        <Checkbox.Labeled label="Control 1"/>
        <Checkbox.Labeled label="Control 2"/>
      </div>
    ),
  },
};
