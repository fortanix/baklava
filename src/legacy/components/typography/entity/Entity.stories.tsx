/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Entity } from './Entity.tsx';


type EntityArgs = React.ComponentProps<typeof Entity>;
type Story = StoryObj<EntityArgs>;

export default {
  component: Entity,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Entity',
  },
  render: (args) => <Entity {...args}/>,
} satisfies Meta<EntityArgs>;


export const EntityStandard: Story = {};

export const EntitySmall: Story = {
  args: {
    size: 'small',
  },
};
