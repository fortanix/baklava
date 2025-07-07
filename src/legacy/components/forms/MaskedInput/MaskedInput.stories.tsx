/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { MaskedInput } from './MaskedInput.tsx';


type MaskedInputArgs = React.ComponentProps<typeof MaskedInput>;
type Story = StoryObj<MaskedInputArgs>;

export default {
  component: MaskedInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    defaultValue: 'This input value should be masked',
  },
  render: (args) => <MaskedInput {...args}/>,
} satisfies Meta<MaskedInputArgs>;


export const MaskedInputStandard: Story = {};
