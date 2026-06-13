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

const generateItems = (itemCount: number) =>
  Object.fromEntries(Array.from({ length: itemCount }, (_, i) => i + 1).map(index => [`item-${index}`, {
    itemKey: `item-${index}`,
    children: `Item ${index}`,
  }]));
const ListWithControlsC = (args: ListArgs) => {
  // const [isTransitionPending, startTransition] = React.useTransition();
  const startTransition = fn => fn();
  
  const [itemCount, setItemCount] = React.useState(10);
  const [items, setItems] = React.useState<Record<ItemKey, ListItemProps>>(() => generateItems(itemCount));
  
  React.useEffect(() => {
    setItems(generateItems(itemCount));
  }, [itemCount]);
  
  const randomizeItems = React.useCallback(() => {
    setItems(items => {
      return Object.fromEntries(Object.entries(items)
        .sort(() => Math.random() >= 0.5 ? 1 : -1)
      );
    });
  }, []);
  
  const randomizeItemsAndSplice = React.useCallback(() => {
    setItems(items => {
      const entries = Object.entries(items)
        .sort(() => Math.random() >= 0.5 ? 1 : -1);
      
      const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
      if (!newItem) { throw new Error(`Should not happen`); }
      const newItemKey = `${newItem}-${entries.length}`;
      
      const startIndex = Math.floor(entries.length / 2);
      entries.splice(startIndex, 1, [newItemKey, { itemKey: newItemKey, children: newItemKey }]);
      
      return Object.fromEntries(entries);
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
    <div>
      <style>{`
        @scope {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .story-list {
            margin-block: 1lh;
          }
        }
      `}</style>
      
      <div>
        <style>{`@scope { display: flex; gap: 1ch; align-items: center; }`}</style>
        <Button kind="secondary" label="10" onPress={() => { startTransition(() => { setItemCount(10); }); }}/>
        <Button kind="secondary" label="100" onPress={() => { startTransition(() => { setItemCount(100); }); }}/>
        <Button kind="secondary" label="1K" onPress={() => { startTransition(() => { setItemCount(1000); }); }}/>
        <Button kind="secondary" label="10K" onPress={() => { startTransition(() => { setItemCount(10_000); }); }}/>
      </div>
      
      <List {...args} className="story-list">
        {Object.entries(items).map(([itemKey, itemProps]) =>
          <List.Item key={itemKey} {...itemProps}/>
        )}
      </List>
      <Button label="Append" onPress={() => { startTransition(() => { appendItem(); }); }}/>
      <Button label="Prepend" onPress={() => { startTransition(() => { prependItem(); }); }}/>
      <Button label="Randomize" onPress={() => { startTransition(() => { randomizeItems(); }); }}/>
      <Button label="Randomize + splice" onPress={() => { startTransition(() => { randomizeItemsAndSplice(); }); }}/>
    </div>
  );
};
export const ListWithControls: Story = {
  decorators: (_, { args }) => <ListWithControlsC {...args}/>,
};
