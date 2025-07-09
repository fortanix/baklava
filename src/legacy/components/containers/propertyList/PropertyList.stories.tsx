/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { PropertyList } from './PropertyList.tsx';


type PropertyListArgs = React.ComponentProps<typeof PropertyList>;
type Story = StoryObj<PropertyListArgs>;

export default {
  component: PropertyList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <PropertyList {...args}/>,
} satisfies Meta<PropertyListArgs>;


export const PropertyListStandard: Story = {};

export const PropertyListWithVariant: Story = {
  args: {
    variant: 'x',
  },
};
