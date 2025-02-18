/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '../../controls/Checkbox/Checkbox.tsx';

import { Label } from './Label.tsx';


type LabelArgs = React.ComponentProps<typeof Label>;
type Story = StoryObj<LabelArgs>;

export default {
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Label',
  },
  render: (args) => <Label {...args}/>,
} satisfies Meta<LabelArgs>;


export const LabelStandard: Story = {
  args: {
    children: <Checkbox/>,
  },
};

export const LabelAtStart: Story = {
  args: {
    position: 'inline-start',
    children: <Checkbox/>,
  },
};

export const LabelAtEnd: Story = {
  args: {
    position: 'inline-end',
    children: <Checkbox/>,
  },
};
