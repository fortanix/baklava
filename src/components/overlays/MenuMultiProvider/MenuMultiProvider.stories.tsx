/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemKey, MenuMultiProvider } from './MenuMultiProvider.tsx';


type MenuMultiProviderArgs = React.ComponentProps<typeof MenuMultiProvider>;
type Story = StoryObj<MenuMultiProviderArgs>;

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
  component: MenuMultiProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    formatItemLabel: formatFruitLabel,
    children: ({ props, selectedOptions }) => {
      const selectedLabels = [...selectedOptions.values()].map(({ label }) => label).join(', ');
      return (
        <Button kind="primary" {...props()}>
          {selectedOptions.size > 0 ? `Selected: ${selectedLabels}` : 'Open dropdown'}
        </Button>
      );
    },
    items: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <MenuMultiProvider.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuMultiProvider {...args}/>,
} satisfies Meta<MenuMultiProviderArgs>;


export const MenuMultiProviderStandard: Story = {};

export const MenuMultiProviderWithDefault: Story = {
  args: {
    defaultSelected: new Set(['item-blueberry', 'item-cherry', 'item-mango']),
  },
};

export const MenuMultiProviderWithInput: Story = {
  args: {
    items: (
      <>
        <MenuMultiProvider.Header unstyled itemKey="header-1" label="Input">
          <InputSearch/>
        </MenuMultiProvider.Header>
        <MenuMultiProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuMultiProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  }
};

export const MenuMultiProviderWithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, selectedOptions }) => (
      <Button kind="primary" {...props()}>
        {selectedOptions.size > 0
          ? `Selected: ${selectedOptions.size}`
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
        <MenuMultiProvider.Action itemKey="action-close" onActivate={close} label="Close" icon="logout">
          Close
        </MenuMultiProvider.Action>
      </>
    ),
  },
};

export const MenuMultiProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const MenuMultiProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const MenuMultiProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuMultiProviderControlledC = (props: React.ComponentProps<typeof MenuMultiProvider>) => {
  const [selectedOptions, setSelectedOptions] = React.useState<Set<ItemKey>>(props.defaultSelected ?? new Set());
  return (
    <>
      <p>Selected: {[...selectedOptions].map(itemKey => formatFruitLabel(itemKey)).join(', ') || '(none)'}</p>
      <MenuMultiProvider
        {...props}
        selected={selectedOptions}
        onSelect={setSelectedOptions}
      />
      <div>
        <Button label="Update state"
          onPress={() => { setSelectedOptions(new Set(['item-razzberry', 'item-strawberry'])); }}
        />
      </div>
    </>
  );
};
export const MenuMultiProviderControlled: Story = {
  render: args => <MenuMultiProviderControlledC {...args}/>,
};
export const MenuMultiProviderControlledWithDefault: Story = {
  render: args => (
    <MenuMultiProviderControlledC
      {...args}
      defaultSelected={new Set([
        'item-blueberry',
        'item-cherry',
        'item-mango',
      ])}
    />
  ),
};
