/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { PublicLayout } from './PublicLayout.tsx';


type PublicLayoutArgs = React.ComponentProps<typeof PublicLayout>;
type Story = StoryObj<PublicLayoutArgs>;

export default {
  component: PublicLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => <div style={{ width: '100svi', height: '100svb', display: 'grid' }}><Story/></div>
  ],
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <PublicLayout {...args}/>,
} satisfies Meta<PublicLayoutArgs>;


export const PublicLayoutStandard: Story = {};

export const PublicLayoutWithVariant: Story = {
  args: {
    variant: 'x',
  },
};
