/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Tag } from './Tag.tsx';


type TagArgs = React.ComponentProps<typeof Tag>;
type Story = StoryObj<TagArgs>;

export default {
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    content: 'Tag Title',
  },
  render: (args) => <Tag {...args}/>,
} satisfies Meta<TagArgs>;


export const TagStory: Story = {
  name: 'Tag',
};

export const TagWithCloseButton: Story = {
  args: {
    onRemove: () => console.log('clicked on close button'),
  },
};
