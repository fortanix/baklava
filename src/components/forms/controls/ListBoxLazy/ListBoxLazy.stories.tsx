/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { generateData } from '../../../tables/util/generateData.ts'; // FIXME: move to a common location

import { InputSearch } from '../Input/InputSearch.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type ItemKey, type VirtualItemKeys } from '../ListBox/ListBoxStore.tsx';
import { ListBoxLazy } from './ListBoxLazy.tsx';


const cachedVirtualItemKeys = (itemKeys: ReadonlyArray<ItemKey>): VirtualItemKeys => {
  const indicesByKey = new Map(itemKeys.map((itemKey, index) => [itemKey, index]));
  return {
    length: itemKeys.length,
    at: (index: number) => itemKeys.at(index),
    indexOf: (itemKey: ItemKey) => indicesByKey.get(itemKey) ?? -1,
  };
};
const generateItemKeys = (count: number) => Array.from({ length: count }, (_, i) => `test-${i}`);

type ListBoxLazyArgs = React.ComponentProps<typeof ListBoxLazy>;
type Story = StoryObj<ListBoxLazyArgs>;

export default {
  component: ListBoxLazy,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    limit: 5,
    onUpdateLimit: () => {},
    renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
  },
  render: (args) => <ListBoxLazy {...args}/>,
} satisfies Meta<ListBoxLazyArgs>;


export const ListBoxLazyStandard: Story = {
  args: {
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(10_000)),
    defaultSelected: 'test-2',
    renderItem: item => `Item ${item.index + 1}`,
    formatItemLabel: itemKey => `Item ${itemKey.split('-')[1]}`,
  },
};

export const ListBoxLazyEmpty: Story = {
  args: {
    virtualItemKeys: [],
  },
};

export const ListBoxLazyLoading: Story = {
  args: {
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    isLoading: true,
  },
};

const ListBoxLazyInfiniteC = (props: ListBoxLazyArgs) => {
  const pageSize = 20;
  const maxItems = 90;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  
  const hasMoreItems = items.length < maxItems;
  
  const updateLimit = React.useCallback((limit: number) => {
    if (hasMoreItems) {
      setLimit(Math.min(limit, maxItems));
      setIsLoading(true); // Immediately set `isLoading` so we can skip a render cycle (before the effect kicks in)
    }
  }, [hasMoreItems]);
  
  React.useEffect(() => {
    setIsLoading(false);
    
    if (hasMoreItems) {
      setIsLoading(true);
      window.setTimeout(() => {
        setIsLoading(false);
        setItems(generateData({ numItems: limit }));
      }, 2000);
    }
  }, [limit, hasMoreItems]);
  
  const virtualItemKeys = items.map(item => item.id);
  
  return (
    <ListBoxLazy
      {...props}
      limit={limit}
      pageSize={pageSize}
      onUpdateLimit={updateLimit}
      virtualItemKeys={virtualItemKeys}
      hasMoreItems={hasMoreItems}
      isLoading={isLoading}
      renderItem={item => <>Item {item.index + 1}</>}
      formatItemLabel={itemKey => `Item ${itemKey.split('-')[1]}`}
    />
  );
};
export const ListBoxLazyInfinite: Story = {
  render: args => <ListBoxLazyInfiniteC {...args}/>,
  args: {
  },
};

const ListBoxLazyWithFilterC = (props: ListBoxLazyArgs) => {
  const pageSize = 20;
  const maxItems = 90;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  const [filter, setFilter] = React.useState('');
  
  const hasMoreItems = items.length < maxItems;
  const itemsFiltered = items.filter(item => item.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  
  const updateLimit = React.useCallback((limit: number) => {
    if (hasMoreItems) {
      setLimit(Math.min(limit, maxItems));
      setIsLoading(true); // Immediately set `isLoading` so we can skip a render cycle (before the effect kicks in)
    }
  }, [hasMoreItems]);
  
  React.useEffect(() => {
    setIsLoading(false);
    
    if (hasMoreItems) {
      setIsLoading(true);
      window.setTimeout(() => {
        setIsLoading(false);
        setItems(generateData({ numItems: limit }));
      }, 2000);
    }
  }, [limit, hasMoreItems]);
  
  const virtualItemKeys = itemsFiltered.map(item => item.id);
  
  return (
    <>
      <InputSearch
        value={filter}
        onChange={event => {
          setFilter(event.target.value);
          //setLimit(5); // When results change, we should scroll back to the start and reset the limit
          //listBoxRef.scrollToStart(); // Maybe?
        }}
      />
      {filter !== 'hide' &&
        <ListBoxLazy
          data-placement="bottom"
          {...props}
          limit={limit}
          pageSize={pageSize}
          onUpdateLimit={updateLimit}
          virtualItemKeys={virtualItemKeys}
          hasMoreItems={hasMoreItems}
          isLoading={isLoading}
          renderItem={item => <>{itemsFiltered[item.index]?.name}</>}
          formatItemLabel={itemKey => itemsFiltered.find(i => i.id === itemKey)?.name ?? 'Unknown'}
          placeholderEmpty={items.length === 0 ? 'No items' : 'No items found'}
        />
      }
    </>
  );
};
export const ListBoxLazyWithFilter: Story = {
  render: args => <ListBoxLazyWithFilterC {...args}/>,
};

const ListBoxLazyWithCustomLoadMoreItemsTriggerC = (props: ListBoxLazyArgs) => {
  const pageSize = 20;
  const maxItems = 90;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  
  const hasMoreItems = items.length < maxItems;
  
  const updateLimit = React.useCallback(async () => {
    if (hasMoreItems) {
      setLimit(Math.min(limit + pageSize, maxItems));
      setIsLoading(true); // Immediately set `isLoading` so we can skip a render cycle (before the effect kicks in)
    }
  }, [limit, hasMoreItems]);
  
  React.useEffect(() => {
    setIsLoading(false);
    
    if (hasMoreItems) {
      setIsLoading(true);
      window.setTimeout(() => {
        setIsLoading(false);
        setItems(generateData({ numItems: limit }));
      }, 2000);
    }
  }, [limit, hasMoreItems]);
  
  const virtualItemKeys = items.map(item => item.id);

  const renderLoadMoreItemsTrigger = () => {
    if (limit === maxItems) { return null; }

    return (
      <Button kind="primary" onPress={updateLimit}>Load more items</Button>
    );
  };
  
  return (
    <ListBoxLazy
      {...props}
      limit={limit}
      virtualItemKeys={virtualItemKeys}
      isLoading={isLoading}
      renderItem={item => <div>Item {item.index + 1}</div>}
      formatItemLabel={itemKey => `Item ${itemKey.split('-')[1]}`}
      loadMoreItemsTriggerType="custom"
      loadMoreItemsTrigger={renderLoadMoreItemsTrigger()}
    />
  );
};
export const ListBoxLazyWithCustomLoadMoreItemsTrigger: Story = {
  render: args => <ListBoxLazyWithCustomLoadMoreItemsTriggerC {...args}/>,
  args: {
  },
};

