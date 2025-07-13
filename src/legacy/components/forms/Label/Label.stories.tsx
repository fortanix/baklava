/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label.tsx';


type LabelArgs = React.ComponentProps<typeof Label.List>;
type Story = StoryObj<LabelArgs>;

export default {
  component: Label.List,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    showTooltip: true,
    labels: Object.fromEntries(Array.from({ length: 10 }, (_, i) => i).map(index =>
      [`label-${index}`, `Label ${index + 1}`],
    ))
  },
  render: (args) => <Label.List {...args}/>,
} satisfies Meta<LabelArgs>;


export const LabelStandard: Story = {};
