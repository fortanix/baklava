/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useDebounce } from '../../../../util/hooks/useDebounce.ts';

import type { Meta, StoryObj } from '@storybook/react';
import { generateData } from '../../../tables/util/generateData.ts'; // FIXME: move to a common location

import { Input } from '../Input/Input.tsx';

import { ListBoxLazy } from './ListBoxLazy.tsx';


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
  },
  render: (args) => <ListBoxLazy {...args}/>,
} satisfies Meta<ListBoxLazyArgs>;


export const ListBoxLazyStandard: Story = {
  args: {
    itemKeys: generateItemKeys(10_000),
    defaultSelected: 'test-2',
    renderItem: item => `Item ${item.index + 1}`,
  },
};

export const ListBoxLazyLoading: Story = {
  args: {
    itemKeys: generateItemKeys(5),
    isLoading: true,
  },
};


const ListBoxLazyInfiniteC = (props: ListBoxLazyArgs) => {
  const pageSize = 10;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState([]);
  
  React.useEffect(() => {
    if (items.length < limit) {
      setIsLoading(true);
      window.setTimeout(() => {
        setItems(Array.from({ length: limit }));
        setIsLoading(false);
      }, 2000);
    }
  }, [limit, items.length]);
  
  const itemKeys = React.useMemo(() => generateItemKeys(items.length), [items.length]);
  
  return (
    <ListBoxLazy
      {...props}
      limit={limit}
      pageSize={pageSize}
      onUpdateLimit={setLimit}
      itemKeys={itemKeys}
      isLoading={isLoading}
      //renderItem={item => <>Item {item.index + 1}</>}
    />
  );
};
export const ListBoxLazyInfinite: Story = {
  render: args => <ListBoxLazyInfiniteC {...args}/>,
  args: {
  },
};

const ListBoxLazyWithFilterC = (props: ListBoxLazyArgs) => {
  const pageSize = 10;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingDebounced] = useDebounce(isLoading, 200);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ name: string }>>([]);
  const [filter, setFilter] = React.useState('');
  
  const itemsFiltered = items.filter(item => item.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  React.useEffect(() => {
    const itemsFiltered = items.filter(item => item.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
    if (itemsFiltered.length < limit) {
      setIsLoading(true);
      
      const load = () => {
        const items = generateData({ numItems: limit });
        setItems(items);
        setIsLoading(false);
        
        /*
        // FIXME: need paging
        if (items.length >= 300) { // Simulate end of list
          console.log('done');
          setIsLoading(false);
        } else if (itemsFiltered.length < limit) {
          window.setTimeout(load, 600);
        } else {
          setIsLoading(false);
        }
        */
      };
      window.setTimeout(load, 600);
    }
  }, [limit, filter, /*isLoading,*/ items]);
  
  const itemKeys = React.useMemo(() => generateItemKeys(itemsFiltered.length), [itemsFiltered.length]);
  
  return (
    <>
      <Input
        placeholder="Search"
        value={filter}
        onChange={event => {
          setFilter(event.target.value);
          //setLimit(5); // When results change, we should scroll back to the start and reset the limit
          //listBoxRef.scrollToStart(); // Maybe?
        }}
      />
      <ListBoxLazy
        {...props}
        limit={limit}
        pageSize={pageSize}
        onUpdateLimit={setLimit}
        itemKeys={itemKeys}
        isLoading={isLoadingDebounced}
        renderItem={item => <>{itemsFiltered[item.index]?.name}</>}
      />
    </>
  );
};
export const ListBoxLazyWithFilter: Story = {
  render: args => <ListBoxLazyWithFilterC {...args}/>,
  args: {
  },
};
