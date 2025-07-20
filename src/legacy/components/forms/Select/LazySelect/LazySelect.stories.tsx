/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LazySelect } from './LazySelect.tsx';


type LazySelectArgs = React.ComponentProps<typeof LazySelect>;
type Story = StoryObj<LazySelectArgs>;

export default {
  component: LazySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <LazySelect {...args}/>,
} satisfies Meta<LazySelectArgs>;


export const LazySelectStandard: Story = {
  args: {
    items: [],
    getSelectedValue: (item: unknown) => item,
    resetItems: () => {},
  },
};
