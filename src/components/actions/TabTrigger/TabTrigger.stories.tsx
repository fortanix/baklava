/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { TabTrigger } from './TabTrigger.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';


type TabTriggerArgs = React.ComponentProps<typeof TabTrigger>;
type Story = StoryObj<TabTriggerArgs>;

export default {
  component: TabTrigger,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'Title',
    description: `
      Description will be up to 2 lines,
      rest goes in ellipses. This is sample data for 
      representation purpose
    `,
    indicator: <Icon icon="caret-right" />,
  },
  render: (args) => <TabTrigger {...args}/>,
} satisfies Meta<TabTriggerArgs>;


export const TabTriggerDefault: Story = {
  args: {
    description: undefined,
    indicator: undefined,
  }
};

export const TabTriggerWithDescription: Story = {};

