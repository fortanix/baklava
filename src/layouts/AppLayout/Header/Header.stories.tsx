/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Header } from './Header.tsx';


type HeaderArgs = React.ComponentProps<typeof Header>;
type Story = StoryObj<HeaderArgs>;

export default {
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<HeaderArgs>;


export const Standard: Story = {
  render: () => <Header>Content</Header>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  },
};
