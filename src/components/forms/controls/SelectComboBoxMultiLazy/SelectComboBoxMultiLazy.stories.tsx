/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';
import { generateData } from '../../../tables/util/generateData.ts'; // FIXME: move to a common location

import { type ItemKey, type VirtualItemKeys, SelectComboBoxMultiLazy } from './SelectComboBoxMultiLazy.tsx';
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

type SelectComboBoxMultiArgs = React.ComponentProps<typeof SelectComboBoxMultiLazy>;
type Story = StoryObj<SelectComboBoxMultiArgs>;

export default {
  component: SelectComboBoxMultiLazy,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test combobox lazy',
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
    dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    },
  },
  render: (args) => <SelectComboBoxMultiLazy {...args}/>,
} satisfies Meta<SelectComboBoxMultiArgs>;

export const SelectComboBoxMultiLazyStandard: Story = {};

export const SelectComboBoxMultiLazyWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

export const SelectComboBoxMultiLazyWithPlacement: Story = {
  args: {
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
    dropdownProps: {
      placement: 'right',
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    },
  },
};

export const SelectComboBoxMultiLazyLoading: Story = {
  args: {
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
    dropdownProps: {
      isLoading: true,
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    },
  },
};

const SelectComboBoxMultiLazyInfiniteC = () => {
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
      <SelectComboBoxMultiLazy
        label="Test combobox"
        placeholder="Choose items"
        selected={selectedKeys}
        onSelect={selectedOptionKeys => {
          setSelectedKeys(selectedOptionKeys);
        }}
        formatItemLabel={itemKey => items.find(i => i.id === itemKey)?.name ?? 'Unknown'}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{items[item.index]?.name}</>,
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
          virtualItemKeys,
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiLazyInfinite: Story = {
  render: args => <SelectComboBoxMultiLazyInfiniteC {...args}/>,
  args: {
  },
};

export const SelectComboBoxMultiLazyWithDefault: Story = {
  args: {
    defaultSelected: new Set(['item-3', 'item-4']),
  },
};

const SelectComboBoxMultiLazyControlledC = (props: React.ComponentProps<typeof SelectComboBoxMultiLazy>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
  
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <SelectComboBoxMultiLazy
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
export const SelectComboBoxMultiLazyControlled: Story = {
  render: args => <SelectComboBoxMultiLazyControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiLazyFullyControlledC = (props: React.ComponentProps<typeof SelectComboBoxMultiLazy>) => {
  const [value, setValue] = React.useState<string>('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
      
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = evt.target.value;
    setValue(newValue);
  };

  const onBlur = () => {
    setValue('');
  };
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <SelectComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        selected={selectedKeys}
        onSelect={selectOptions => {
          setValue('');
          setSelectedKeys(selectOptions);
        }}
        dropdownProps={{
          ...props.dropdownProps,
          onBlur,
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKeys(new Set(['item-1'])); }}/></div>
    </>
  );
};
export const SelectComboBoxMultiLazyFullyControlled: Story = {
  render: args => <SelectComboBoxMultiLazyFullyControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiLazyUncontrolledC = (props: React.ComponentProps<typeof SelectComboBoxMultiLazy>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set([]));
      
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ') ?? '(none)'}</div>
      <SelectComboBoxMultiLazy
        {...props}
        placeholder="Choose items"
        onSelect={selectOptions => {
          setSelectedKeys(selectOptions);
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiLazyUncontrolled: Story = {
  render: args => <SelectComboBoxMultiLazyUncontrolledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiLazyWithFilterC = () => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(() => new Set([]));
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  const hasMoreItems = items.length < maxItems;
  const itemsFiltered = items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  
  const updateLimit = React.useCallback((limit: number) => {
    if (hasMoreItems) {
      setLimit(Math.min(limit, maxItems));
      setIsLoading(true); // Immediately set `isLoading` so we can skip a render cycle (before the effect kicks in)
    }
  }, [hasMoreItems]);
   
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIsDropdownOpen(true);
    const newValue = evt.target.value;
    setFilter(newValue);
  };

  const formatItemLabel = (itemKey: string) => items.find(i => i.id === itemKey)?.name ?? 'Unknown';

  const onBlur = () => {
    setFilter('');
  };

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
      <SelectComboBoxMultiLazy
        label="Test combobox"
        placeholder="Choose items"
        value={filter}
        onChange={onChange}
        selected={selectedKeys}
        onBlur={onBlur}
        onSelect={selectOptions => {
          setSelectedKeys(selectOptions);
        }}
        formatItemLabel={formatItemLabel}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit: limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{items.find(i => i.id === item.key)?.name }</>,
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
          virtualItemKeys,
          open: isDropdownOpen,
          onOpenChange: setIsDropdownOpen,
          onBlur,
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiLazyWithFilter: Story = {
  render: args => <SelectComboBoxMultiLazyWithFilterC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiLazyInFormC = (props: React.ComponentProps<typeof SelectComboBoxMultiLazy>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        event.preventDefault();
        const selected = new FormData(event.currentTarget).getAll('controlledComboBoxMultiLazy[]');
        notify.info(`You have chosen: ${selected.join(', ') || 'none'}`);
      }}
    >
      <SelectComboBoxMultiLazy {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </form>
  );
};
export const SelectComboBoxMultiLazyInForm: Story = {
  render: args => <SelectComboBoxMultiLazyInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'controlledComboBoxMultiLazy',
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
    dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    },
  },
};


const SelectComboBoxMultiLazyWithLoadMoreItemsTriggerC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMultiLazy>>) => {
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
    <SelectComboBoxMultiLazy
      label="Test SelectComboBox"
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
      formatItemLabel={itemKey => itemsFiltered.find(i => i.id === itemKey)?.name ?? 'Unknown'}
      dropdownProps={{
        limit: limit,
        pageSize: pageSize,
        hasMoreItems: hasMoreItems,
        isLoading: isLoading,
        renderItem: item => <>{itemsFiltered[item.index]?.name}</>,
        placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
        loadMoreItemsTriggerType: 'custom',
        loadMoreItemsTrigger: renderLoadMoreItemsTrigger(),
        virtualItemKeys,
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const SelectComboBoxMultiLazyWithLoadMoreItemsTrigger: Story = {
  render: args => <SelectComboBoxMultiLazyWithLoadMoreItemsTriggerC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};

