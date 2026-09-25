/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemKey, ListBoxMultiProvider } from './ListBoxMultiProvider.tsx';


type ListBoxMultiProviderArgs = React.ComponentProps<typeof ListBoxMultiProvider>;
type Story = StoryObj<ListBoxMultiProviderArgs>;

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
  component: ListBoxMultiProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    children: ({ props, selectedOptions }) => {
      const selectedLabels = Array.from(selectedOptions).map(key => formatFruitLabel(key)).join(', ');
      return (
        <Button kind="primary" {...props()}>
          {selectedOptions.size > 0 ? `Selected: ${selectedLabels}` : 'Open dropdown'}
        </Button>
      );
    },
    items: (
      <>
        {Object.keys(fruits).map(fruitKey =>
          <ListBoxMultiProvider.Option key={fruitKey} itemKey={fruitKey} label={formatFruitLabel(fruitKey)}/>
        )}
      </>
    ),
    onSelectedChange: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <ListBoxMultiProvider {...args}/>,
} satisfies Meta<ListBoxMultiProviderArgs>;


export const ListBoxMultiProviderStandard: Story = {};

export const ListBoxMultiProviderWithDefault: Story = {
  args: {
    defaultSelected: new Set(['item-blueberry', 'item-cherry', 'item-mango']),
  },
};

export const ListBoxMultiProviderWithInput: Story = {
  args: {
    children: ({ props, selectedOptions }) => {
      return (
        <Button kind="primary" {...props()}>
          {selectedOptions.size > 0 ? `Selected: ${selectedOptions.size} options` : 'Open dropdown'}
        </Button>
      );
    },
    items: (
      <>
        <ListBoxMultiProvider.Segment sticky="start">
          <InputSearch/>
        </ListBoxMultiProvider.Segment>
        <ListBoxMultiProvider.Option itemKey="option-1" label="Option 1"/>
        <ListBoxMultiProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  }
};

export const ListBoxMultiProviderWithPlacement: Story = {
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

export const ListBoxMultiProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <ListBoxMultiProvider.Option itemKey="option-1" label="Option 1"/>
        <ListBoxMultiProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  },
};

export const ListBoxMultiProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const ListBoxMultiProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const ListBoxMultiProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const ListBoxMultiProviderControlledC = (props: React.ComponentProps<typeof ListBoxMultiProvider>) => {
  const [selectedOptions, setSelectedOptions] = React.useState<Set<ItemKey>>(props.defaultSelected ?? new Set());
  return (
    <>
      <p>Selected: {[...selectedOptions].map(itemKey => formatFruitLabel(itemKey)).join(', ') || '(none)'}</p>
      <ListBoxMultiProvider
        {...props}
        selected={selectedOptions}
        onSelectedChange={setSelectedOptions}
      />
      <div>
        <Button label="Update state"
          onPress={() => { setSelectedOptions(new Set(['item-razzberry', 'item-strawberry'])); }}
        />
      </div>
    </>
  );
};
export const ListBoxMultiProviderControlled: Story = {
  render: args => <ListBoxMultiProviderControlledC {...args}/>,
};
export const ListBoxMultiProviderControlledWithDefault: Story = {
  render: args => (
    <ListBoxMultiProviderControlledC
      {...args}
      defaultSelected={new Set([
        'item-blueberry',
        'item-cherry',
        'item-mango',
      ])}
    />
  ),
};
