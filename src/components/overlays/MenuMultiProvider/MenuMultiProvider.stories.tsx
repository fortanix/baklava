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

// Sample options
const fruits = {
  apple: 'Apple',
  apricot: 'Apricot',
  blueberry: 'Blueberry',
  cherry: 'Cherry',
  durian: 'Durian',
  jackfruit: 'Jackfruit',
  melon: 'Melon',
  mango: 'Mango',
  mangosteen: 'Mangosteen',
  orange: 'Orange',
  peach: 'Peach',
  pineapple: 'Pineapple',
  razzberry: 'Razzberry',
  strawberry: 'Strawberry',
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
    label: 'Test dropdown menu provider',
    children: ({ props, selectedOptions }) => (
      <Button kind="primary" {...props()}>
        {selectedOptions.size > 0 ? `Selected: ${selectedOptions.size}` : 'Open dropdown'}
      </Button>
    ),
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


export const MenuMultiProviderStandard: Story = {
  args: {
    formatItemLabel: formatFruitLabel,
    defaultSelected: new Set(['blueberry', 'cherry', 'mango']),
    children: ({ props, selectedOptions }) => {
      const selectedLabels = [...selectedOptions.values()].map(({ label }) => label);
      return (
        <Button kind="primary" {...props()}>
          {selectedOptions.size > 0 ? `Selected: ${selectedLabels.join(', ')}` : 'Open dropdown'}
        </Button>
      );
    },
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
