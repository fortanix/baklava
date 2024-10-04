/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Nav } from './Nav.tsx';


type LayoutArgs = React.ComponentProps<typeof Nav>;
type Story = StoryObj<LayoutArgs>;

export default {
  component: Nav,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<LayoutArgs>;


export const Standard: Story = {
  render: () => <Nav/>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  },
};
