/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ListBoxLazy } from './ListBoxLazy.tsx';


type ListBoxLazyArgs = React.ComponentProps<typeof ListBoxLazy>;
type Story = StoryObj<ListBoxLazyArgs>;

export default {
  component: ListBoxLazy,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <ListBoxLazy {...args}/>,
} satisfies Meta<ListBoxLazyArgs>;


export const ListBoxLazyStandard: Story = {};
