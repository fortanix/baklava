/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { type Item, generateItems } from './generateData.ts';

import { type LazySelectQuery, LazySelect } from './LazySelect.tsx';


type CustomPageState = undefined;

type LazySelectArgs = React.ComponentProps<typeof LazySelect<Item, CustomPageState>>;
type Story = StoryObj<LazySelectArgs>;

export default {
  component: LazySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    getItemId: item => item.id,
    
    // UI
    getSelectedValue: item => item?.name ?? 'None selected',
    renderLabel: item => item.name,
  },
  render: (args) => <LazySelect {...args}/>,
} satisfies Meta<LazySelectArgs>;


const LazySelectDec = (props: LazySelectArgs) => {
  const [selectedItem, setSelectedItem] = React.useState<null | Item>(props.selectedItem);
  const [items, setItems] = React.useState<Array<Item>>(props.items);
  
  const handleUpdate = (updatedItems: Array<Item>) => {
    setItems(items => { return [ ...items, ...updatedItems ] });
  };
  
  const query = React.useCallback<LazySelectQuery<Item, CustomPageState>>(async params => {
    const { previousPageState, limit, previousItem, filters } = params;
    
    const seedValue = `after-${previousItem?.id}`;
    const itemsPage = generateItems({ numItems: limit + 1, seedValue });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { itemsPage, previousPageState };
    
//       const promise = new Promise((resolve)=> {
//         setTimeout(() => {
//           resolve(generateSobjects({ numItems: 11 }))
//         }, 2000);
//       });
// 
//       const itemsPage = await promise;
// 
//       // Filtering based on query
//       const searchQueries = filters.filter(item => item.fieldName === "" && item?.operation?.['$text']?.['$search'])
//         .map(item => item?.operation?.['$text']?.['$search']);
// 
//       const updatedItemsPage = searchQueries.length > 0 ?
//         itemsPage.filter(item => searchQueries.some(query => item.name.toLowerCase().includes(query.toLowerCase())))
//         : itemsPage;
// 
//       return { itemsPage: updatedItemsPage, previousPageState };
  }, []);
  
  return (
    <LazySelect
      query={query}
      {...props}
      items={items}
      selectedItem={selectedItem}
      onSelect={setSelectedItem}
      updateItems={handleUpdate}
      resetItems={() => { setItems([]); }}
    />
  );
};

export const LazySelectStandard: Story = {
  decorators: [(_, { args }) => <LazySelectDec {...args}/>],
  args: {
    items: generateItems(),
  },
};

export const LazySelectEmpty: Story = {
  decorators: [(_, { args }) => <LazySelectDec {...args}/>],
  args: {
    items: [], // No items
    query: async () => ({ itemsPage: [], previousPageState: undefined }),
  },
};


/*
export const LoadSelectDataLazily = (): React.ReactElement => {
  const [selectedItem, setSelectedItem] = React.useState<Sobject | null>(null);
  const [items, setItems] = React.useState<Array<Sobject>>([]);

  const handleUpdate = (updatedItems: Array<Sobject>) => {
    setItems(items => { return [ ...items, ...updatedItems ] });
  };

  const query = React.useCallback(
    async (params): Promise<{ itemsPage: Array<Sobject> }> => {
      const {
        previousPageState,
        filters,
      } = params;

      const promise = new Promise((resolve)=> {
        setTimeout(() => {
          resolve(generateSobjects({ numItems: 11 }))
        }, 2000);
      });

      const itemsPage = await promise;

      // Filtering based on query
      const searchQueries = filters.filter(item => item.fieldName === "" && item?.operation?.['$text']?.['$search'])
        .map(item => item?.operation?.['$text']?.['$search']);

      const updatedItemsPage = searchQueries.length > 0 ?
        itemsPage.filter(item => searchQueries.some(query => item.name.toLowerCase().includes(query.toLowerCase())))
        : itemsPage;

      return { itemsPage: updatedItemsPage, previousPageState };
  }, []);

  return (
    <LazySelect<Sobject>
      getItemId={(sobject) => sobject.id}
      onSelect={(sobject) => {
        setSelectedItem(sobject);
      }}
      resetItems={() => {
        setItems([]);
      }}
      items={items}
      updateItems={handleUpdate}
      selectedItem={selectedItem}
      renderLabel={(item) => item.name}
      getSelectedValue={(item) => item?.name || ''}
      query={query}
    />
  );
};
*/
