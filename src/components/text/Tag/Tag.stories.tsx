/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Card } from '../../containers/Card/Card.tsx';

import { Tag } from './Tag.tsx';
import { loremIpsum } from '../../../util/storybook/LoremIpsum.tsx';


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


export const TagStandard: Story = {};

export const TagWithCloseButton: Story = {
  args: {
    onRemove: () => { notify.info('Clicked on remove'); },
  },
};

export const TagWithOverflow: Story = {
  decorators: [Story => <Card style={{ maxWidth: 300 }}><Story/></Card>],
  args: {
    content: loremIpsum(),
    onRemove: () => { notify.info('Clicked on remove'); },
  },
};
