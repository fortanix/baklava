/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemDetails, MenuProvider, ItemKey } from './MenuProvider.tsx';


type MenuProviderArgs = React.ComponentProps<typeof MenuProvider>;
type Story = StoryObj<MenuProviderArgs>;

export default {
  component: MenuProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test dropdown menu provider',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined' ? `Selected: ${selectedOption?.label ?? 'none'}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuProvider.Option itemKey="option-2" label="Option 2"/>
        <MenuProvider.Option itemKey="option-3" label="Option 3"/>
        <MenuProvider.Option itemKey="option-4" label="Option 4"/>
        <MenuProvider.Option itemKey="option-5" label="Option 5"/>
        <MenuProvider.Option itemKey="option-6" label="Option 6"/>
        <MenuProvider.Option itemKey="option-7" label="Option 7"/>
        <MenuProvider.Option itemKey="option-8" label="Option 8"/>
      </>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuProvider {...args}/>,
} satisfies Meta<MenuProviderArgs>;


export const MenuProviderStandard: Story = {};

export const MenuProviderWithInput: Story = {
  args: {
    items: (
      <>
        <MenuProvider.Header unstyled itemKey="header-1" label="Input">
          <InputSearch/>
        </MenuProvider.Header>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
      </>
    ),
  }
};

export const MenuProviderWithPlacement: Story = {
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
  },
};

export const MenuProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuProvider.Option itemKey="option-2" label="Option 2"/>
        <MenuProvider.Action itemKey="action-close" onActivate={close} label="Close">
          Close
        </MenuProvider.Action>
      </>
    ),
  },
};

export const MenuProviderWithClickAction: Story = {
  args: {
    action: 'click',
  },
};

export const MenuProviderWithFocusAction: Story = {
  args: {
    action: 'focus',
  },
};

export const MenuProviderWithHoverAction: Story = {
  args: {
    action: 'hover',
  },
};

const MenuProviderControlledC = (props: React.ComponentProps<typeof MenuProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemDetails>(null);
  return (
    <>
      <p>Selected: {selectedOption?.label ?? 'none'}</p>
      <MenuProvider
        {...props}
        selected={selectedOption?.itemKey ?? null}
        onSelect={(_key, details) => { setSelectedOption(details); }}
      />
    </>
  );
};
export const MenuProviderControlled: Story = {
  render: args => <MenuProviderControlledC {...args}/>,
};
