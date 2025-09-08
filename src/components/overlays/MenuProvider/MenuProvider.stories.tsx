/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemKey, MenuProvider } from './MenuProvider.tsx';


type MenuProviderArgs = React.ComponentProps<typeof MenuProvider>;
type Story = StoryObj<MenuProviderArgs>;

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
  component: MenuProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    formatItemLabel: formatFruitLabel,
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined' ? `Selected: ${selectedOption?.label ?? 'none'}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <MenuProvider.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuProvider {...args}/>,
} satisfies Meta<MenuProviderArgs>;

export const MenuProviderStandard: Story = {};

export const MenuProviderWithDefault: Story = {
  args: {
    defaultSelected: 'item-blueberry',
  },
};

export const MenuProviderWithInput: Story = {
  args: {
    items: (
      <>
        <MenuProvider.Header unstyled itemKey="header-1" label="Input">
          <InputSearch/>
        </MenuProvider.Header>
        <MenuProvider.Static><input type="file"/></MenuProvider.Static>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuProvider.Option itemKey="option-2" label="Option 2"/>
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

export const MenuProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const MenuProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const MenuProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuProviderControlledC = (props: React.ComponentProps<typeof MenuProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  
  return (
    <>
      <p>Selected: {selectedOption === null ? '(none)' : formatFruitLabel(selectedOption)}</p>
      <MenuProvider
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
