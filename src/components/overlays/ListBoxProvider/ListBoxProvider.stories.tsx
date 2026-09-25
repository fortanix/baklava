/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { type ItemKey, ListBoxProvider } from './ListBoxProvider.tsx';


type ListBoxProviderArgs = React.ComponentProps<typeof ListBoxProvider>;
type Story = StoryObj<ListBoxProviderArgs>;

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
  component: ListBoxProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {selectedOption !== null ? `Selected: ${formatFruitLabel(selectedOption)}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxProvider.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
    onSelectedChange: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <ListBoxProvider {...args}/>,
} satisfies Meta<ListBoxProviderArgs>;

export const ListBoxProviderStandard: Story = {};

export const ListBoxProviderWithDefault: Story = {
  args: {
    defaultSelected: 'item-blueberry',
  },
};

const formatListBoxProviderWithInput = (itemKey: string) => itemKey.replace('option-', 'Option ');
export const ListBoxProviderWithInput: Story = {
  args: {
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {selectedOption !== null ? `Selected: ${formatListBoxProviderWithInput(selectedOption)}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        <ListBoxProvider.Segment sticky="start">
          <InputSearch/>
        </ListBoxProvider.Segment>
        <ListBoxProvider.Static><input type="file"/></ListBoxProvider.Static>
        <ListBoxProvider.Option itemKey="option-1" label="Option 1"/>
        <ListBoxProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  }
};

export const ListBoxProviderWithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined'
          ? `Selected: ${selectedOption ?? 'none'}`
          : 'Open dropdown placed to the right'
        }
      </Button>
    ),
  },
};

export const ListBoxProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <ListBoxProvider.Option itemKey="option-1" label="Option 1"/>
        <ListBoxProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  },
};

export const ListBoxProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const ListBoxProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const ListBoxProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const ListBoxProviderControlledC = (props: React.ComponentProps<typeof ListBoxProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  
  return (
    <>
      <p>Selected: {selectedOption === null ? '(none)' : formatFruitLabel(selectedOption)}</p>
      <ListBoxProvider
        {...props}
        selected={selectedOption}
        onSelectedChange={setSelectedOption}
      />
      <div><Button label="Update state" onPress={() => { setSelectedOption('item-strawberry'); }}/></div>
    </>
  );
};
export const ListBoxProviderControlled: Story = {
  render: args => <ListBoxProviderControlledC {...args}/>,
};
export const ListBoxProviderControlledWithDefault: Story = {
  render: args => <ListBoxProviderControlledC {...args} defaultSelected="item-blueberry"/>,
};
