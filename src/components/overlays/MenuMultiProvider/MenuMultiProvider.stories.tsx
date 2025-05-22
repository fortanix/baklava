/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemKey, type ItemDetails, MenuMultiProvider } from './MenuMultiProvider.tsx';


type MenuMultiProviderArgs = React.ComponentProps<typeof MenuMultiProvider>;
type Story = StoryObj<MenuMultiProviderArgs>;

export default {
  component: MenuMultiProvider,
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
        <MenuMultiProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuMultiProvider.Option itemKey="option-2" label="Option 2"/>
        <MenuMultiProvider.Option itemKey="option-3" label="Option 3"/>
        <MenuMultiProvider.Option itemKey="option-4" label="Option 4"/>
        <MenuMultiProvider.Option itemKey="option-5" label="Option 5"/>
        <MenuMultiProvider.Option itemKey="option-6" label="Option 6"/>
        <MenuMultiProvider.Option itemKey="option-7" label="Option 7"/>
        <MenuMultiProvider.Option itemKey="option-8" label="Option 8"/>
      </>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuMultiProvider {...args}/>,
} satisfies Meta<MenuMultiProviderArgs>;


export const MenuMultiProviderStandard: Story = {};

export const MenuMultiProviderWithInput: Story = {
  args: {
    items: (
      <>
        <MenuMultiProvider.Header unstyled itemKey="header-1" label="Input">
          <InputSearch/>
        </MenuMultiProvider.Header>
        <MenuMultiProvider.Option itemKey="option-1" label="Option 1"/>
      </>
    ),
  }
};

export const MenuMultiProviderWithPlacement: Story = {
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

export const MenuMultiProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <MenuMultiProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuMultiProvider.Option itemKey="option-2" label="Option 2"/>
        <MenuMultiProvider.Action itemKey="action-close" onActivate={close} label="Close">
          Close
        </MenuMultiProvider.Action>
      </>
    ),
  },
};

export const MenuMultiProviderWithClickAction: Story = {
  args: {
    action: 'click',
  },
};

export const MenuMultiProviderWithFocusAction: Story = {
  args: {
    action: 'focus',
  },
};

export const MenuMultiProviderWithHoverAction: Story = {
  args: {
    action: 'hover',
  },
};

const MenuMultiProviderControlledC = (props: React.ComponentProps<typeof MenuMultiProvider>) => {
  const [selectedOptions, setSelectedOptions] = React.useState<Map<ItemKey, ItemDetails>>(new Map());
  return (
    <>
      <p>Selected: {[...selectedOptions.values()].map(({ label }) => label || '(unknown)').join(', ')}</p>
      <MenuMultiProvider
        {...props}
        selected={new Set(selectedOptions.keys())}
        onSelect={(args) => {
          console.log(args);
        }}
      />
    </>
  );
};
export const MenuMultiProviderControlled: Story = {
  render: args => <MenuMultiProviderControlledC {...args}/>,
};
