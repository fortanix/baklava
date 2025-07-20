/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TextArea } from './TextArea.tsx';


type TextAreaArgs = React.ComponentProps<typeof TextArea>;
type Story = StoryObj<TextAreaArgs>;

export default {
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    defaultValue: 'Multiple\nline\ninput',
  },
  render: (args) => <TextArea {...args}/>,
} satisfies Meta<TextAreaArgs>;


export const TextAreaStandard: Story = {};

export const TextAreaFixedHeight: Story = {
  args: {
    fixedHeight: true,
  },
};
