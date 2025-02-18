/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from '../../controls/Radio/Radio.tsx';

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
    children: (
      <>
        <Radio.Labeled label="Control 1"/>
        <Radio.Labeled label="Control 2"/>
      </>
    ),
  },
  render: (args) => <FieldSet {...args}/>,
} satisfies Meta<FieldSetArgs>;


export const FieldSetStandard: Story = {};
