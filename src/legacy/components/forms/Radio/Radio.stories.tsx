/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from './Radio.tsx';


type RadioArgs = React.ComponentProps<typeof Radio.Group>;
type Story = StoryObj<RadioArgs>;

export default {
  component: Radio.Group,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    primary: true,
    children: Array.from({ length: 3 }, (_, i) => i).map(index =>
      <Radio.Item key={index} label={`Radio ${index + 1}`} value={`radio-${index}`}/>
    ),
  },
  render: (args) => <Radio.Group {...args}/>,
} satisfies Meta<RadioArgs>;


export const RadioStandard: Story = {};
