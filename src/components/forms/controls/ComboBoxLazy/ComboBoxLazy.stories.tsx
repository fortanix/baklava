/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { generateData } from '../../../tables/util/generateData.ts'; // FIXME: move to a common location
import { type ItemKey, type VirtualItemKeys, ComboBoxLazy } from './ComboBoxLazy.tsx';
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
const generateItemKeys = (count: number) => Array.from({ length: count }, (_, i) => `item-${i}`);

type ComboBoxLazyArgs = React.ComponentProps<typeof ComboBoxLazy>;
type Story = StoryObj<ComboBoxLazyArgs>;

export default {
  component: ComboBoxLazy,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test combobox',
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
    },
  },
  render: (args) => <ComboBoxLazy {...args}/>,
} satisfies Meta<ComboBoxLazyArgs>;

export const ComboBoxLazyStandard: Story = {};

export const ComboBoxLazyWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

export const ComboBoxLazyWithPlacement: Story = {
  args: {
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    dropdownProps: {
      placement: 'right',
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
    },
  },
};

export const ComboBoxLazyLoading: Story = {
  args: {
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(5)),
    dropdownProps: {
      isLoading: true,
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
    },
  },
};

const ComboBoxLazyInfiniteC = () => {
  const pageSize = 20;
  const maxItems = 90;

  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
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
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        label="Test combobox"
        virtualItemKeys={virtualItemKeys}
        placeholder="Choose an item"
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit: limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{items[item.index]?.name}</>,
          formatItemLabel: itemKey => items.find(i => i.id === itemKey)?.name ?? 'Unknown',
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
        }}
      />
    </>
  );
};
export const ComboBoxLazyInfinte: Story = {
  render: args => <ComboBoxLazyInfiniteC {...args}/>,
  args: {
  },
};

const ComboBoxLazyWithDefaultC = (props: React.ComponentProps<typeof ComboBoxLazy>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>('test-3');
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        {...props}
        placeholder="Choose an item"
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const ComboBoxLazyWithDefault: Story = {
  render: args => <ComboBoxLazyWithDefaultC {...args}/>,
  args: {
  },
};

const ComboBoxLazyControlledC = (props: React.ComponentProps<typeof ComboBoxLazy>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        {...props}
        placeholder="Choose an item"
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const ComboBoxLazyControlled: Story = {
  render: args => <ComboBoxLazyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxLazyFullyControlledC = (props: React.ComponentProps<typeof ComboBoxLazy>) => {
  const [value, setValue] = React.useState<string>('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        {...props}
        placeholder="Choose an item"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        onBlur={(evt: React.FocusEvent<HTMLInputElement>) => {
          const value = evt.target.value;

          if (value === '') {
            setSelectedKey(null);
          } else if (selectedKey) {
            setValue(props.dropdownProps.formatItemLabel(selectedKey) ?? '');
          }
        }}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
          if (selectedOption !== null) {
            setValue(selectedOption.label);
          }
        }}
      />
    </>
  );
};
export const ComboBoxLazyFullyControlled: Story = {
  render: args => <ComboBoxLazyFullyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxLazyUncontrolledC = (props: React.ComponentProps<typeof ComboBoxLazy>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        {...props}
        placeholder="Choose an item"
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const ComboBoxLazyUncontrolled: Story = {
  render: args => <ComboBoxLazyUncontrolledC {...args}/>,
  args: {
  },
};

const ComboBoxLazyWithFilterC = () => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  
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
      <div>Input: {filter ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBoxLazy
        label="Test combobox"
        virtualItemKeys={virtualItemKeys}
        placeholder="Choose an item"
        value={filter}
        onChange={event => { setFilter(event.target.value); }}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
          if (selectedOption !== null) {
            setFilter(selectedOption.label);
          }
        }}
        dropdownProps={{
          onUpdateLimit: updateLimit,
          limit: limit,
          pageSize: pageSize,
          hasMoreItems: hasMoreItems,
          isLoading: isLoading,
          renderItem: item => <>{itemsFiltered[item.index]?.name}</>,
          formatItemLabel: itemKey => itemsFiltered.find(i => i.id === itemKey)?.name ?? 'Unknown',
          placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
        }}
      />
    </>
  );
};
export const ComboBoxLazyWithFilter: Story = {
  render: args => <ComboBoxLazyWithFilterC {...args}/>,
  args: {
  },
};

const ComboBoxLazyInFormC = (props: React.ComponentProps<typeof ComboBoxLazy>) => {
  return (
    <>
      <form
        id="story-form"
        onSubmit={event => {
          console.log(event.currentTarget) 
          event.preventDefault();
          notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
        }}
      />
      <ComboBoxLazy {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </>
  );
};
export const ComboBoxLazyInForm: Story = {
  render: args => <ComboBoxLazyInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    dropdownProps: {
      limit: 5,
      renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
      formatItemLabel: item => `Item ${item.split('-')[1]}`,
    },
  },
};

const ComboBoxLazyAutocompleteC = (props: Partial<React.ComponentProps<typeof ComboBoxLazy>>) => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  const pushBlock = (block: string) => { if (!blocks.includes(block)) setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); }; 
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
    <ComboBoxLazy
      label="Test ComboBox"
      virtualItemKeys={virtualItemKeys}
      Input={InputSearch}
      placeholder="Choose your options"
      value={filter}
      onChange={event => { setFilter(event.target.value); }}
      prefix={blocks.join(', ')}
      selected={selectedKey}
      onSelect={(selectedOptionKey, selectedOption) => {
        props.onSelect?.(selectedOptionKey, selectedOption);
        
        if (selectedOption !== null) {
          //To fill in the value in the input:
          //setValue(selectedOption.label);
          
          pushBlock(selectedOption.label);
          setFilter('');
        }
        
        // Unset the selected state after a successful selection is made
        window.setTimeout(() => { setSelectedKey(null); }, 300);
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
          
        if (event.key === 'Enter' && filter.trim() !== '') {
          pushBlock(filter);
          setFilter('');
        } else if (event.key === 'Backspace' && filter === '') {
          popBlock();
        }
      }}
      dropdownProps={{
        onUpdateLimit: updateLimit,
        limit: limit,
        pageSize: pageSize,
        hasMoreItems: hasMoreItems,
        isLoading: isLoading,
        renderItem: item => <>{itemsFiltered[item.index]?.name}</>,
        formatItemLabel: itemKey => itemsFiltered.find(i => i.id === itemKey)?.name ?? 'Unknown',
        placeholderEmpty: items.length === 0 ? 'No items' : 'No items found',
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const ComboBoxLazyAutocomplete: Story = {
  render: args => <ComboBoxLazyAutocompleteC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};

const ComboBoxLazyWithLoadMoreItemsTriggerC = (props: Partial<React.ComponentProps<typeof ComboBoxLazy>>) => {
  const pageSize = 20;
  const maxItems = 90;

  const [filter, setFilter] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<{ id: string, name: string }>>([]);
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  const pushBlock = (block: string) => { if (!blocks.includes(block)) setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); }; 
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
    <ComboBoxLazy
      label="Test ComboBox"
      virtualItemKeys={virtualItemKeys}
      Input={InputSearch}
      placeholder="Choose your options"
      value={filter}
      onChange={event => { setFilter(event.target.value); }}
      prefix={blocks.join(', ')}
      selected={selectedKey}
      onSelect={(selectedOptionKey, selectedOption) => {
        props.onSelect?.(selectedOptionKey, selectedOption);
        
        if (selectedOption !== null) {
          //To fill in the value in the input:
          //setValue(selectedOption.label);
          
          pushBlock(selectedOption.label);
          setFilter('');
        }
        
        // Unset the selected state after a successful selection is made
        window.setTimeout(() => { setSelectedKey(null); }, 300);
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
          
        if (event.key === 'Enter' && filter.trim() !== '') {
          pushBlock(filter);
          setFilter('');
        } else if (event.key === 'Backspace' && filter === '') {
          popBlock();
        }
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
        loadMoreItemsTrigger: renderLoadMoreItemsTrigger()
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const ComboBoxLazyWithLoadMoreItemsTrigger: Story = {
  render: args => <ComboBoxLazyWithLoadMoreItemsTriggerC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};

