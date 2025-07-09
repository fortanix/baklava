/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Tag } from './Tag.tsx';


type TagArgs = React.ComponentProps<typeof Tag>;
type Story = StoryObj<TagArgs>;

export default {
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Tag {...args}/>,
} satisfies Meta<TagArgs>;


export const TagStandard: Story = {};
export const TagSmall: Story = { args: { small: true } };

export const TagPrimary: Story = { args: { primary: true } };
export const TagPrimarySmall: Story = { args: { primary: true, small: true } };

export const TagWithDashedBorder: Story = { args: { dashedBorder: true } };
export const TagWithDashedBorderSmall: Story = { args: { dashedBorder: true, small: true } };

export const TagWithCloseAction: Story = {
  args: {
    primary: true,
    onClose: () => { notify.info('Triggered the close action'); },
  },
};
export const TagWithCloseActionSmall: Story = {
  args: {
    primary: true,
    onClose: () => { notify.info('Triggered the close action'); },
    small: true,
  },
};
