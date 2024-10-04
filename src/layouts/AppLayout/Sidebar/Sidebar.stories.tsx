/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Sidebar } from './Sidebar.tsx';


type SidebarArgs = React.ComponentProps<typeof Sidebar>;
type Story = StoryObj<SidebarArgs>;

export default {
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<SidebarArgs>;


export const Standard: Story = {
  render: () => <Sidebar>Content</Sidebar>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  },
};
