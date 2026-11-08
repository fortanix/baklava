/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { generateUsers } from '../../../../util/storybook/StorybookUtils.tsx';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type ItemKey, type SelectedState, SelectComboBoxMulti } from './SelectComboBoxMulti.tsx';

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
const formatFruitLabel = (itemKey: ItemKey): string => {
  return fruits[itemKey as FruitKey] ?? 'UNKNOWN';
};
const formatFruitLabels = (selected: SelectedState): string => {
  return [...selected].map(fruitKey => formatFruitLabel(fruitKey)).join(', ') || '(none)';
};


type SelectComboBoxMultiArgs = React.ComponentProps<typeof SelectComboBoxMulti>;
type Story = StoryObj<SelectComboBoxMultiArgs>;

export default {
  component: SelectComboBoxMulti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test SelectComboBoxMulti',
    placeholder: 'Select a fruit',
    formatSelected: formatFruitLabel,
    options: Object.entries(fruits).map(([fruitKey, fruitName]) =>
      <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
    ),
  },
  render: (args) => <SelectComboBoxMulti {...args}/>,
} satisfies Meta<SelectComboBoxMultiArgs>;

export const SelectComboBoxMultiStandard: Story = {};

export const SelectComboBoxMultiWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

export const SelectComboBoxMultiWithOverflow: Story = {
  decorators: [
    Story => <div style={{ inlineSize: 'min(90vi, 500px)' }}><Story/></div>,
  ],
  args: {
    defaultSelected: new Set(Object.keys(fruits)),
  },
};

const SelectComboBoxMultiWithExternalSelectedC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  const { defaultSelected, ...propsRest } = props;
  const [selected, setSelected] = React.useState<SelectedState>(defaultSelected ?? new Set());
  
  return (
    <div>
      <style>{`
        @scope {
          inline-size: min(90vi, 500px);
          
          p {
            margin-block-start: 0.6lh;
          }
        }
      `}</style>
      
      <SelectComboBoxMulti
        {...propsRest}
        renderSelectedInline={false}
        selected={selected}
        onSelectedChange={({ selected }) => { setSelected(selected); }}
      />
      <p>
        <SelectComboBoxMulti.SelectedList
          formatSelected={propsRest.formatSelected}
          selected={selected}
          onSelectedChange={({ selected }) => { setSelected(selected); }}
        />
      </p>
    </div>
  );
};
export const SelectComboBoxMultiWithExternalSelected: Story = {
  render: args => <SelectComboBoxMultiWithExternalSelectedC {...args}/>,
  args: {
    defaultSelected: new Set(Object.keys(fruits)),
  },
};

const SelectComboBoxMultiControlledC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  const { defaultSelected, ...propsRest } = props;
  const [selected, setSelected] = React.useState<SelectedState>(defaultSelected ?? new Set());
  
  return (
    <>
      <p>Selected: {formatFruitLabels(selected)}</p>
      <SelectComboBoxMulti
        {...propsRest}
        selected={selected}
        onSelectedChange={({ selected }) => { setSelected(selected); }}
      />
      <p>
        <Button label="Update state" onPress={() => { setSelected(new Set(['item-strawberry', 'item-razzberry'])); }}/>
      </p>
    </>
  );
};
export const SelectComboBoxMultiControlled: Story = {
  render: args => <SelectComboBoxMultiControlledC {...args}/>,
};
export const SelectComboBoxMultiControlledWithDefault: Story = {
  render: args => <SelectComboBoxMultiControlledC {...args}/>,
  args: { defaultSelected: new Set(['item-blueberry', 'item-cherry']) },
};

const SelectComboBoxMultiFullyControlledC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  const [filter, setFilter] = React.useState<string>('');
  const [selected, setSelected] = React.useState<SelectedState>(new Set());
  const [open, setOpen] = React.useState(false);
  
  const updateFilter = () => { setFilter('test'); };
  const updateSelected = () => { setSelected(new Set(['item-blueberry', 'item-cherry'])); };
  const updateOpen = () => { setOpen(true); };
  
  return (
    <>
      <p>Input: {filter ?? '(none)'}</p>
      <p>Selected: {formatFruitLabels(selected)}</p>
      <SelectComboBoxMulti
        {...props}
        filter={filter}
        onFilterChange={setFilter}
        selected={selected}
        onSelectedChange={({ selected }) => { setSelected(selected); }}
        dropdownProps={{
          open,
          onOpenChange: ({ open }) => { setOpen(open); },
        }}
      />
      <p><Button label="Update filter" onPress={updateFilter}/></p>
      <p><Button label="Update selected" onPress={updateSelected}/></p>
      <p><Button label="Update open" onPress={updateOpen}/></p>
    </>
  );
};
export const SelectComboBoxMultiFullyControlled: Story = {
  render: args => <SelectComboBoxMultiFullyControlledC {...args}/>,
};

const SelectComboBoxMultiWithFilterC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  const [filter, setFilter] = React.useState<string>('');
  const [selected, setSelected] = React.useState<SelectedState>(new Set());
  
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes(filter.toLowerCase()));
  
  return (
    <SelectComboBoxMulti
      {...props}
      filter={filter}
      onFilterChange={setFilter}
      selected={selected}
      onSelectedChange={({ selected }) => { setSelected(selected); }}
      options={fruitsFiltered.map(([fruitKey, fruitName]) =>
        <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
      )}
    />
  );
};
export const SelectComboBoxMultiWithFilter: Story = {
  render: args => <SelectComboBoxMultiWithFilterC {...args}/>,
};

const SelectComboBoxMultiWithFilterVirtualizedC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  const [filter, setFilter] = React.useState<string>('');
  const [selected, setSelected] = React.useState<SelectedState>(new Set());
  
  const users = Object.fromEntries(
    generateUsers({ numItems: 100 })
    .map(user => [user.id, user])
  );
  const usersFiltered = Object.fromEntries(Object.entries(users)
    .filter(([_key, user]) => user.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
  );
  
  return (
    <SelectComboBoxMulti
      {...props}
      filter={filter}
      onFilterChange={setFilter}
      selected={selected}
      onSelectedChange={({ selected }) => { setSelected(selected); }}
      formatSelected={selectedKey => selectedKey === null ? '(None)' : (users[selectedKey]?.name ?? '(Unknown)')}
      options={
        <SelectComboBoxMulti.SegmentVirtual
          items={{
            count: Object.keys(usersFiltered).length,
            getItemKey: index => {
              const key = Object.keys(usersFiltered)[index];
              if (typeof key === 'undefined') { throw new Error(`Unable to find key`); }
              return key;
            },
            renderItem: (props, { key, index }) => {
              if (typeof key !== 'string') { throw new Error(`Invalid key`); } // Should not happen
              const user = users[key];
              if (!user) { throw new Error(`Unmatched key`); } // Should not happen
              
              return <SelectComboBoxMulti.Option key={key} itemKey={user.id} {...props} label={user.name}/>;
            },
          }}
        />
      }
    />
  );
};
export const SelectComboBoxMultiWithFilterVirtualized: Story = {
  render: args => <SelectComboBoxMultiWithFilterVirtualizedC {...args}/>,
};

const SelectComboBoxMultiInFormC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        event.preventDefault();
        const selected = new FormData(event.currentTarget).getAll('story_component1[]');
        const selectedFormatted = selected
          .map(fruitKey => {
            if (typeof fruitKey !== 'string') { return 'UNKNOWN' }
            return formatFruitLabel(fruitKey);
          })
          .join(', ');
        notify.info(`You have chosen: ${selectedFormatted || '(none)'}`);
      }}
    >
      <SelectComboBoxMulti {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </form>
  );
};
export const SelectComboBoxMultiInForm: Story = {
  render: args => <SelectComboBoxMultiInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
    defaultSelected: new Set(['item-blueberry', 'item-strawberry']),
  },
};

const SelectComboBoxMultiAutocompleteC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const ref = React.useRef<React.ComponentRef<typeof SelectComboBoxMulti>>(null);
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<SelectedState>(new Set());
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  
  const pushBlock = (block: string) => { setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); };
  
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => !blocks.includes(fruit))
    .filter(([_key, fruit]) => fruit.toLowerCase().startsWith((filter ?? '').toLowerCase()));
  
  return (
    <SelectComboBoxMulti
      ref={ref}
      Input={InputSearch}
      label="Test SelectComboBoxMulti"
      aria-autocomplete="list"
      placeholder="Choose your favorite fruits"
      {...props}
      filter={filter}
      onFilterChange={setFilter}
      prefix={blocks.join(', ')}
      options={fruitsFiltered.map(([fruitKey, fruitName]) =>
        <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
      )}
      dropdownProps={{
        placeholderEmpty: filter === '' ? 'No fruits available' : 'No matching fruits found',
        ...props.dropdownProps,
      }}
      selected={selected}
      formatSelected={formatFruitLabel}
      onSelectedChange={event => {
        props.onSelectedChange?.(event);
        
        if (event.selected !== null) {
          pushBlock(formatFruitLabels(event.selected) ?? 'Unknown');
          setFilter('');
        }
        
        // Unset the selected state after a successful selection is made
        // window.setTimeout(() => {
        //   setSelected(null);
        //   ref.current?.requestOpenChange({ open: false });
        // }, 300);
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
        
        if (event.key === 'Enter' && filter.trim() !== '') {
          pushBlock(filter);
          setFilter('');
          ref.current?.requestOpenChange({ open: false });
        } else if (event.key === 'Backspace' && filter === '') {
          popBlock();
        }
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const SelectComboBoxMultiAutocomplete: Story = {
  render: args => <SelectComboBoxMultiAutocompleteC {...args}/>,
};
