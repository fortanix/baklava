/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

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
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined' ? `Selected: ${selectedOption?.label ?? 'none'}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        <DropdownMenuProvider.Option itemKey="option-1" label="Option 1"/>
        <DropdownMenuProvider.Option itemKey="option-2" label="Option 2"/>
        <DropdownMenuProvider.Option itemKey="option-3" label="Option 3"/>
        <DropdownMenuProvider.Option itemKey="option-4" label="Option 4"/>
        <DropdownMenuProvider.Option itemKey="option-5" label="Option 5"/>
        <DropdownMenuProvider.Option itemKey="option-6" label="Option 6"/>
        <DropdownMenuProvider.Option itemKey="option-7" label="Option 7"/>
        <DropdownMenuProvider.Option itemKey="option-8" label="Option 8"/>
      </>
    ),
  },
  render: (args) => <DropdownMenuProvider {...args}/>,
} satisfies Meta<DropdownMenuProviderArgs>;


export const DropdownMenuProviderStandard: Story = {};

export const DropdownMenuProviderWithInput: Story = {
  args: {
    items: (
      <>
        <DropdownMenuProvider.Header unstyled itemKey="header-1" label="Input">
          <InputSearch/>
        </DropdownMenuProvider.Header>
        <DropdownMenuProvider.Option itemKey="option-1" label="Option 1"/>
      </>
    ),
  }
};

export const DropdownMenuProviderWithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined'
          ? `Selected: ${selectedOption?.label ?? 'none'}`
          : 'Open dropdown placed to the right'
        }
      </Button>
    ),
    items: (
      <>
        <DropdownMenuProvider.Option itemKey="option-1" label="Option 1"/>
        <DropdownMenuProvider.Option itemKey="option-2" label="Option 2"/>
        <DropdownMenuProvider.Option itemKey="option-3" label="Option 3"/>
        <DropdownMenuProvider.Option itemKey="option-4" label="Option 4"/>
        <DropdownMenuProvider.Option itemKey="option-5" label="Option 5"/>
        <DropdownMenuProvider.Option itemKey="option-6" label="Option 6"/>
      </>
    ),
  },
};

export const DropdownMenuProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <DropdownMenuProvider.Option itemKey="option-1" label="Option 1"/>
        <DropdownMenuProvider.Option itemKey="option-2" label="Option 2"/>
        <DropdownMenuProvider.Action itemKey="action-close" onActivate={close} label="Close">
          Close
        </DropdownMenuProvider.Action>
      </>
    ),
  },
};
