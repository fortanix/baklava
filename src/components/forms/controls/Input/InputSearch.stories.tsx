/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { InputSearch } from './InputSearch.tsx';


type InputSearchArgs = React.ComponentProps<typeof InputSearch>;
type Story = StoryObj<InputSearchArgs>;

export default {
  component: InputSearch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <InputSearch {...args}/>,
} satisfies Meta<InputSearchArgs>;


export const InputSearchStandard: Story = {};
