/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';

import { DropdownMenuProvider } from './DropdownMenuProvider.tsx';


type DropdownMenuProviderArgs = React.ComponentProps<typeof DropdownMenuProvider>;
type Story = StoryObj<DropdownMenuProviderArgs>;

export default {
  component: DropdownMenuProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <DropdownMenuProvider {...args}/>,
} satisfies Meta<DropdownMenuProviderArgs>;


export const Standard: Story = {
  name: 'DropdownMenuProvider',
  args: {
    children: ({ props, state }) => (
      <Button kind="primary" {...props()}>
        {state.selectedOption ? `Selected: ${state.selectedOption}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        <DropdownMenuProvider.Option optionKey="option-1" label="Option 1"/>
        <DropdownMenuProvider.Option optionKey="option-2" label="Option 2"/>
        <DropdownMenuProvider.Option optionKey="option-3" label="Option 3"/>
        <DropdownMenuProvider.Option optionKey="option-4" label="Option 4"/>
        <DropdownMenuProvider.Option optionKey="option-5" label="Option 5"/>
        <DropdownMenuProvider.Option optionKey="option-6" label="Option 6"/>
        <DropdownMenuProvider.Option optionKey="option-7" label="Option 7"/>
        <DropdownMenuProvider.Option optionKey="option-8" label="Option 8"/>
      </>
    ),
  },
};

export const WithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, state }) => (
      <Button kind="primary" {...props()}>
        {state.selectedOption ? `Selected: ${state.selectedOption}` : 'Open dropdown placed to the right'}
      </Button>
    ),
    items: (
      <>
        <DropdownMenuProvider.Option optionKey="option-1" label="Option 1"/>
        <DropdownMenuProvider.Option optionKey="option-2" label="Option 2"/>
        <DropdownMenuProvider.Option optionKey="option-3" label="Option 3"/>
        <DropdownMenuProvider.Option optionKey="option-4" label="Option 4"/>
        <DropdownMenuProvider.Option optionKey="option-5" label="Option 5"/>
        <DropdownMenuProvider.Option optionKey="option-6" label="Option 6"/>
      </>
    ),
  },
};
