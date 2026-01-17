/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { generateData } from '../../tables/util/generateData.ts'; // FIXME: move to a common location

import { Button } from '../../actions/Button/Button.tsx';

import { type ItemKey, type VirtualItemKeys, MenuLazyProvider } from './MenuLazyProvider.tsx';


type MenuLazyProviderArgs = React.ComponentProps<typeof MenuLazyProvider>;
type Story = StoryObj<MenuLazyProviderArgs>;

const cachedVirtualItemKeys = (itemKeys: ReadonlyArray<ItemKey>): VirtualItemKeys => {
  const indicesByKey = new Map(itemKeys.map((itemKey, index) => [itemKey, index]));
  return {
    length: itemKeys.length,
    at: (index: number) => itemKeys.at(index),
    indexOf: (itemKey: ItemKey) => indicesByKey.get(itemKey) ?? -1,
  };
};
const generateItemKeys = (count: number) => Array.from({ length: count }, (_, i) => `test-${i}`);

export default {
  component: MenuLazyProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu lazy provider',
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    limit: 5,
    onUpdateLimit: () => {},
    renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
    renderItemLabel: item => `Item ${item.split('-')[1]}`,
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined' ? `Selected: ${selectedOption?.label ?? 'none'}` : 'Open dropdown'}
      </Button>
    ),
    onSelect: (selectedItemKey, selectedItem) => { console.log('Selected:', selectedItemKey, selectedItem); },
  },
  render: (args) => <MenuLazyProvider {...args}/>,
} satisfies Meta<MenuLazyProviderArgs>;

export const MenuLazyProviderStandard: Story = {};

export const MenuLazyProviderWithDefault: Story = {
  args: {
    defaultSelected: 'test-3',
  },
};

export const MenuLazyProviderWithPlacement: Story = {
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

export const MenuLazyProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const MenuLazyProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const MenuLazyProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuLazyProviderControlledC = (props: React.ComponentProps<typeof MenuLazyProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  const renderItemLabel = (item: string) => `Item ${item.split('-')[1]}`;
  
  return (
    <>
      <p>Selected: {selectedOption === null ? '(none)' : renderItemLabel(selectedOption)}</p>
      <MenuLazyProvider
        {...props}
        selected={selectedOption}
        onSelect={setSelectedOption}
      />
      <div><Button label="Update state" onPress={() => { setSelectedOption('test-3'); }}/></div>
    </>
  );
};
export const MenuLazyProviderControlled: Story = {
  render: args => <MenuLazyProviderControlledC {...args}/>,
};
export const MenuLazyProviderControlledWithDefault: Story = {
  render: args => <MenuLazyProviderControlledC {...args} defaultSelected="test-3"/>,
};
