/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { generateData } from '../../tables/util/generateData.ts'; // FIXME: move to a common location

import { Button } from '../../actions/Button/Button.tsx';

import { type ItemKey, MenuLazyProvider } from './MenuLazyProvider.tsx';


type MenuLazyProviderArgs = React.ComponentProps<typeof MenuLazyProvider>;
type Story = StoryObj<MenuLazyProviderArgs>;

// Sample options
const fruits = {
  'item-apple': 'Apple',
  'item-apricot': 'Apricot',
  'item-blueberry': 'Blueberry',
  'item-cherry': 'Cherry',
  'item-durian': 'Durian',
  'item-jackfruit': 'Jackfruit',
  'item-melon': 'Melon',
  'item-mango': 'Mango',
  'item-mangosteen': 'Mangosteen',
  'item-orange': 'Orange',
  'item-peach': 'Peach',
  'item-pineapple': 'Pineapple',
  'item-razzberry': 'Razzberry',
  'item-strawberry': 'Strawberry',
};
type FruitKey = keyof typeof fruits;
const formatFruitLabel = (itemKey: ItemKey): string => fruits[itemKey as FruitKey] ?? 'UNKNOWN';

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
    renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
    renderItemLabel: item => `Item ${item.index}`,
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined' ? `Selected: ${selectedOption?.label ?? 'none'}` : 'Open dropdown'}
      </Button>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuLazyProvider {...args}/>,
} satisfies Meta<MenuLazyProviderArgs>;

export const MenuLazyProviderStandard: Story = {};

export const MenuLazyProviderWithDefault: Story = {
  args: {
    defaultSelected: 'item-blueberry',
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

export const MenuProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuProviderControlledC = (props: React.ComponentProps<typeof MenuLazyProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  
  return (
    <>
      <p>Selected: {selectedOption === null ? '(none)' : formatFruitLabel(selectedOption)}</p>
      <MenuLazyProvider
        {...props}
        formatItemLabel={formatFruitLabel}
        selected={selectedOption}
        onSelect={setSelectedOption}
      />
      <div><Button label="Update state" onPress={() => { setSelectedOption('item-strawberry'); }}/></div>
    </>
  );
};
export const MenuProviderControlled: Story = {
  render: args => <MenuProviderControlledC {...args}/>,
};
export const MenuProviderControlledWithDefault: Story = {
  render: args => <MenuProviderControlledC {...args} defaultSelected="item-blueberry"/>,
};
