/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { type ItemKey, List } from './Composite.tsx';
import { Button } from '../actions/Button/Button.tsx';


type ListArgs = React.ComponentProps<typeof List>;
type Story = StoryObj<ListArgs>;

export default {
  component: List,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <List {...args}/>,
} satisfies Meta<ListArgs>;

type ListItemProps = React.ComponentProps<typeof List.Item>;

// Sample items
const fruits = [
  'Apple',
  'Apricot',
  'Blueberry',
  'Cherry',
  'Durian',
  'Jackfruit',
  'Melon',
  'Mango',
  'Mangosteen',
  'Orange',
  'Peach',
  'Pineapple',
  'Razzberry',
  'Strawberry',
];


export const ListStandard: Story = {
  args: {
    children: (
      <>
        <List.Item itemKey="1">Item 1</List.Item>
        <div>
          <List.Item itemKey="2">Item 2</List.Item>
        </div>
        <List.Item itemKey="3">Item 3</List.Item>
      </>
    ),
  },
};

const ListWithReorderingC = (args: ListArgs) => {
  const [items, setItems] = React.useState<Record<ItemKey, ListItemProps>>(() =>
    Object.fromEntries(fruits.map(fruitName => [fruitName, { itemKey: fruitName, children: fruitName }]))
  );
  
  const randomizeItems = React.useCallback(() => {
    setItems(items => {
      return Object.fromEntries(Object.entries(items)
        .sort(() => Math.random() >= 0.5 ? 1 : -1)
      );
    });
  }, []);
  
  const appendItem = React.useCallback(() => {
    const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
    if (!newItem) { throw new Error(`Should not happen`); }
    
    setItems(items => {
      const newItemKey = `${newItem}-${Object.keys(items).length}`;
      return { ...items, [newItemKey]: { itemKey: newItemKey, children: newItemKey } };
    });
  }, []);
  
  const prependItem = React.useCallback(() => {
    const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
    if (!newItem) { throw new Error(`Should not happen`); }
    
    setItems(items => {
      const newItemKey = `${newItem}-${Object.keys(items).length}`;
      return { [newItemKey]: { itemKey: newItemKey, children: newItemKey }, ...items };
    });
  }, []);
  
  return (
    <>
      <List>
        {Object.entries(items).map(([itemKey, itemProps]) =>
          <List.Item key={itemKey} {...itemProps}/>
        )}
      </List>
      <Button label="Append" onPress={() => { appendItem(); }}/><br/>
      <Button label="Prepend" onPress={() => { prependItem(); }}/><br/>
      <Button label="Randomize" onPress={() => { randomizeItems(); }}/>
    </>
  );
};
export const ListWithReordering: Story = {
  decorators: (_, { args }) => <ListWithReorderingC {...args}/>,
};
