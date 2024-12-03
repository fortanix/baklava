/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { SearchInput } from './SearchInput.tsx';
import type { Meta, StoryObj } from '@storybook/react';


type SearchInputArgs = React.ComponentProps<typeof SearchInput>;
type Story = StoryObj<typeof SearchInput>;

const SearchInputTemplate = (props: SearchInputArgs) => {
  const [value, setValue] = React.useState('');

  return (
    <SearchInput {...props} value={value} onChange={(evt) => setValue(evt.target.value)} />
  );
};

export default {
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
  },
  render: (args: SearchInputArgs) => (
    <SearchInputTemplate {...args}/>
  ),
} satisfies Meta<SearchInputArgs>;


export const Standard: Story = {};