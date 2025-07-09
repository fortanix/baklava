/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { H1, H2, H3, H4, H5, H6 } from './Headings.tsx';


type HeadingsArgs = React.ComponentProps<typeof H1>;
type Story = StoryObj<HeadingsArgs>;

export default {
  component: H1,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Heading',
  },
} satisfies Meta<HeadingsArgs>;


export const Heading1: Story = { render: (args) => <H1 {...args}/>, args: { children: 'Heading 1' } };
export const Heading2: Story = { render: (args) => <H2 {...args}/>, args: { children: 'Heading 2' } };
export const Heading3: Story = { render: (args) => <H3 {...args}/>, args: { children: 'Heading 3' } };
export const Heading4: Story = { render: (args) => <H4 {...args}/>, args: { children: 'Heading 4' } };
export const Heading5: Story = { render: (args) => <H5 {...args}/>, args: { children: 'Heading 5' } };
export const Heading6: Story = { render: (args) => <H6 {...args}/>, args: { children: 'Heading 6' } };
