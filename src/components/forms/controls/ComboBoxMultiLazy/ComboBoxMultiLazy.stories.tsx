/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';
import { generateData } from '../../../tables/util/generateData.ts'; // FIXME: move to a common location

import { type ItemKey, type VirtualItemKeys, ComboBoxMultiLazy } from './ComboBoxMultiLazy.tsx';
import { Button } from '../../../actions/Button/Button.tsx';


// Sample options
const cachedVirtualItemKeys = (itemKeys: ReadonlyArray<ItemKey>): VirtualItemKeys => {
  const indicesByKey = new Map(itemKeys.map((itemKey, index) => [itemKey, index]));

  return {
    length: itemKeys.length,
    at: (index: number) => itemKeys.at(index),
    indexOf: (itemKey: ItemKey) => indicesByKey.get(itemKey) ?? -1,
  };
};
const generateItemKeys = (count: number) => Array.from({ length: count }, (_, i) => `item-${i + 1}`);

type ComboBoxMultiArgs = React.ComponentProps<typeof ComboBoxMultiLazy>;
type Story = StoryObj<ComboBoxMultiArgs>;

export default {
  component: ComboBoxMultiLazy,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test combobox lazy',
   dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    },
  },
  render: (args) => <ComboBoxMultiLazy {...args}/>,
} satisfies Meta<ComboBoxMultiArgs>;

export const ComboBoxMultiLazyStandard: Story = {};

export const ComboBoxMultiLazyWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

export const ComboBoxMultiLazyWithPlacement: Story = {
  args: {
    dropdownProps: {
      placement: 'right',
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    },
  },
};

export const ComboBoxMultiLazyLoading: Story = {
  args: {
    dropdownProps: {
      isLoading: true,
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    },
  },
};

const ComboBoxMultiLazyInfiniteC = () => {
  const pageSize = 20;
  const maxItems = 90;

  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
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
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        label="Test combobox"
        placeholder="Choose items"
        selected={selectedKeys}
        onSelect={selectedOptionKeys => {
          setSelectedKeys(selectedOptionKeys);
        }}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{items[item.index]?.name}</>,
          formatItemLabel: itemKey => items.find(i => i.id === itemKey)?.name ?? 'Unknown',
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
          virtualItemKeys,
        }}
      />
    </>
  );
};
export const ComboBoxMultiLazyInfinte: Story = {
  render: args => <ComboBoxMultiLazyInfiniteC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyWithDefaultC = (props: React.ComponentProps<typeof ComboBoxMultiLazy>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set(['item-3', 'item-4']));
  
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        selected={selectedKeys}
        onSelect={selectedOptions => {
          setSelectedKeys(selectedOptions);
        }}
      />
    </>
  );
};
export const ComboBoxMultiLazyWithDefault: Story = {
  render: args => <ComboBoxMultiLazyWithDefaultC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyControlledC = (props: React.ComponentProps<typeof ComboBoxMultiLazy>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
  
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        selected={selectedKeys}
        onSelect={selectedOptions => {
          setSelectedKeys(selectedOptions);
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKeys(new Set(['item-1'])); }}/></div>
    </>
  );
};
export const ComboBoxMultiLazyControlled: Story = {
  render: args => <ComboBoxMultiLazyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyFullyControlledC = (props: React.ComponentProps<typeof ComboBoxMultiLazy>) => {
  const [value, setValue] = React.useState<string>('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
      
  const handleInputFocusOut = (_evt: React.FocusEvent<HTMLInputElement>) => {
    setValue('');
  };

  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        onBlur={handleInputFocusOut}
        selected={selectedKeys}
        onSelect={selectOptions => {
          setValue('');
          setSelectedKeys(selectOptions);
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKeys(new Set(['item-1'])); }}/></div>
    </>
  );
};
export const ComboBoxMultiLazyFullyControlled: Story = {
  render: args => <ComboBoxMultiLazyFullyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyUncontrolledC = (props: React.ComponentProps<typeof ComboBoxMultiLazy>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
      
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        onSelect={selectOptions => {
          setSelectedKeys(selectOptions);
        }}
      />
    </>
  );
};
export const ComboBoxMultiLazyUncontrolled: Story = {
  render: args => <ComboBoxMultiLazyUncontrolledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyWithFilterC = () => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(() => new Set([]));
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  
  const hasMoreItems = items.length < maxItems;
  const itemsFiltered = items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  
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
      <div>Input: {filter ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <ComboBoxMultiLazy
        label="Test combobox"
        placeholder="Choose items"
        value={filter}
        onChange={event => { setFilter(event.target.value); }}
        selected={selectedKeys}
        onSelect={selectOptions => {
          setSelectedKeys(selectOptions);
          setFilter('');
        }}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit: limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{items.find(i => i.id === item.key)?.name }</>,
          formatItemLabel: itemKey => items.find(i => i.id === itemKey)?.name ?? 'Unknown',
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
          virtualItemKeys,
        }}
      />
    </>
  );
};
export const ComboBoxMultiLazyWithFilter: Story = {
  render: args => <ComboBoxMultiLazyWithFilterC {...args}/>,
  args: {
  },
};

const ComboBoxMultiLazyInFormC = (props: React.ComponentProps<typeof ComboBoxMultiLazy>) => {
  return (
    <>
      <form
        id="story-form"
        onSubmit={event => {
          event.preventDefault();
          const selected = new FormData(event.currentTarget).getAll('controlledComboBoxMultiLazy[]');
          notify.info(`You have chosen: ${selected.join(', ') || 'none'}`);
        }}
      />
      <ComboBoxMultiLazy {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </>
  );
};
export const ComboBoxMultiLazyInForm: Story = {
  render: args => <ComboBoxMultiLazyInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'controlledComboBoxMultiLazy',
    dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    },
  },
};


const ComboBoxMultiLazyWithLoadMoreItemsTriggerC = (props: Partial<React.ComponentProps<typeof ComboBoxMultiLazy>>) => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(() => new Set([]));
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  const hasMoreItems = items.length < maxItems;
  const itemsFiltered = items.filter(item => item.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
 
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
  
  const virtualItemKeys = itemsFiltered.map(item => item.id);

  const renderLoadMoreItemsTrigger = () => {
    if (limit === maxItems) { return null; }

    return (
      <Button kind="primary" onPress={updateLimit}>Load more items</Button>
    );
  };

  return (
    <ComboBoxMultiLazy
      label="Test ComboBox"
      Input={InputSearch}
      placeholder="Choose your options"
      value={filter}
      onChange={event => { setFilter(event.target.value); }}
      selected={selectedKeys}
      onSelect={(selectedOptionKeys, selectedOption) => {
        props.onSelect?.(selectedOptionKeys, selectedOption);
        setSelectedKeys(selectedOptionKeys);
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
      }}
      dropdownProps={{
        limit: limit,
        pageSize: pageSize,
        hasMoreItems: hasMoreItems,
        isLoading: isLoading,
        renderItem: item => <>{itemsFiltered[item.index]?.name}</>,
        formatItemLabel: itemKey => itemsFiltered.find(i => i.id === itemKey)?.name ?? 'Unknown',
        placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
        loadMoreItemsTriggerType: 'custom',
        loadMoreItemsTrigger: renderLoadMoreItemsTrigger(),
        virtualItemKeys,
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const ComboBoxMultiLazyWithLoadMoreItemsTrigger: Story = {
  render: args => <ComboBoxMultiLazyWithLoadMoreItemsTriggerC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};

