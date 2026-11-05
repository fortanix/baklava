/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { generateUsers } from '../../../../util/storybook/StorybookUtils.tsx';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type SelectedState, SelectComboBox } from './SelectComboBox.tsx';

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
const formatFruitLabel = (itemKey: SelectedState): null | string => {
  if (itemKey === null) { return null; } // Fall back to placeholder
  return fruits[itemKey as FruitKey] ?? 'UNKNOWN';
};


type SelectComboBoxArgs = React.ComponentProps<typeof SelectComboBox>;
type Story = StoryObj<SelectComboBoxArgs>;

export default {
  component: SelectComboBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test SelectComboBox',
    placeholder: 'Select a fruit',
    formatSelected: formatFruitLabel,
    options: Object.entries(fruits).map(([fruitKey, fruitName]) =>
      <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
    ),
  },
  render: (args) => <SelectComboBox {...args}/>,
} satisfies Meta<SelectComboBoxArgs>;

export const SelectComboBoxStandard: Story = {};

export const SelectComboBoxWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

const SelectComboBoxControlledC = ({ defaultSelected, ...props }: React.ComponentProps<typeof SelectComboBox>) => {
  const [selected, setSelected] = React.useState<SelectedState>(defaultSelected ?? null);
  
  return (
    <>
      <p>Selected: {formatFruitLabel(selected) ?? '(none)'}</p>
      <SelectComboBox
        {...props}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <p><Button label="Update state" onPress={() => { setSelected('item-strawberry'); }}/></p>
    </>
  );
};
export const SelectComboBoxControlled: Story = {
  render: args => <SelectComboBoxControlledC {...args}/>,
};
export const SelectComboBoxControlledWithDefault: Story = {
  render: args => <SelectComboBoxControlledC {...args}/>,
  args: { defaultSelected: 'item-blueberry' },
};

const SelectComboBoxFullyControlledC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [filter, setFilter] = React.useState<string>('');
  const [selected, setSelected] = React.useState<SelectedState>(null);
  const [open, setOpen] = React.useState(false);
  
  const updateFilter = () => { setFilter('test'); };
  const updateSelected = () => { setSelected('item-blueberry'); };
  const updateOpen = () => { setOpen(true); };
  
  return (
    <>
      <p>Input: {filter ?? '(none)'}</p>
      <p>Selected: {selected ?? '(none)'}</p>
      <SelectComboBox
        {...props}
        filter={filter}
        onFilterChange={setFilter}
        selected={selected}
        onSelectedChange={setSelected}
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
export const SelectComboBoxFullyControlled: Story = {
  render: args => <SelectComboBoxFullyControlledC {...args}/>,
};

const SelectComboBoxWithFilterC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [filter, setFilter] = React.useState<string>('');
  const [selected, setSelected] = React.useState<SelectedState>(null);
  
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes(filter.toLowerCase()));
  
  return (
    <SelectComboBox
      {...props}
      filter={filter}
      onFilterChange={setFilter}
      selected={selected}
      onSelectedChange={setSelected}
      options={fruitsFiltered.map(([fruitKey, fruitName]) =>
        <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
      )}
    />
  );
};
export const SelectComboBoxWithFilter: Story = {
  render: args => <SelectComboBoxWithFilterC {...args}/>,
};

const SelectComboBoxWithFilterVirtualizedC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [filter, setFilter] = React.useState<string>('y');
  const [selected, setSelected] = React.useState<SelectedState>(null);
  
  const users = Object.fromEntries(
    generateUsers({ numItems: 100 })
      .filter(user => user.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
      .map(user => [user.id, user])
  );
  
  return (
    <SelectComboBox
      {...props}
      filter={filter}
      //onFilterChange={setFilter}
      onFilterChange={filter => { console.log('filter', filter); return 'a'; }}
      selected={selected}
      onSelectedChange={setSelected}
      formatSelected={selectedKey => selectedKey === null ? '(None)' : users[selectedKey]?.name ?? 'xx'}
      options={
        <SelectComboBox.SegmentVirtual
          items={{
            count: Object.keys(users).length,
            getItemKey: index => Object.keys(users)[index] ?? 0,
            renderItem: (props, { key, index }) => {
              if (typeof key !== 'string') { return null; } // Should not happen
              const user = users[key];
              if (!user) { return null; } // Should not happen
              
              return <SelectComboBox.Option key={key} itemKey={user.id} {...props} label={user.name}/>;
            },
          }}
        />
      }
    />
  );
};
export const SelectComboBoxWithFilterVirtualized: Story = {
  render: args => <SelectComboBoxWithFilterVirtualizedC {...args}/>,
};

const SelectComboBoxInFormC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        event.preventDefault();
        notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
      }}
    >
      <SelectComboBox {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </form>
  );
};
export const SelectComboBoxInForm: Story = {
  render: args => <SelectComboBoxInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
};

/*
const InputSearchAutocomplete = (props: React.ComponentProps<typeof InputSearch>) => {
  const [value, setValue] = React.useState('');
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  const pushBlock = (block: string) => { setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); };
  
  return (
    <InputSearch
      value={value}
      onChange={event => { setValue(event.target.value); }}
      prefix={blocks.join(' ')}
      {...props}
      onKeyDown={event => {
        //props.onKeyDown?.(event);
        
        if (event.key === 'Enter' && value.trim() !== '') {
          pushBlock(value);
          setValue('');
        } else if (event.key === 'Backspace' && value === '') {
          popBlock();
        }
      }}
    />
  );
};
*/
const SelectComboBoxAutocompleteC = (props: Partial<React.ComponentProps<typeof SelectComboBox>>) => {
  const [value, setValue] = React.useState('');
  const [selected, setSelected] = React.useState<SelectedState>(null);
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  const pushBlock = (block: string) => { if (!blocks.includes(block)) setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); };
  
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  
  return (
    <SelectComboBox
      label="Test SelectComboBox"
      Input={InputSearch}
      placeholder="Choose your favorite fruits"
      value={value}
      onChange={event => { setValue(event.target.value); }}
      prefix={blocks.join(', ')}
      {...props}
      options={fruitsFiltered.map(([fruitKey, fruitName]) =>
        <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
      )}
      selected={selected}
      formatItemLabel={formatFruitLabel}
      onSelectedChange={selectedOptionKey => {
        props.onSelectedChange?.(selectedOptionKey);
        
        if (selectedOptionKey !== null) {
          //To fill in the value in the input:
          //setValue(selectedOption.label);
          
          pushBlock(formatFruitLabel(selectedOptionKey));
          setValue('');
        }
        
        // Unset the selected state after a successful selection is made
        window.setTimeout(() => { setSelected(null); }, 300);
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
          
        if (event.key === 'Enter' && value.trim() !== '') {
          pushBlock(value);
          setValue('');
        } else if (event.key === 'Backspace' && value === '') {
          popBlock();
        }
      }}
    />
  );
};
/** Note: when you use the `ComboBox` for autocomplete, you must also set `aria-autocomplete="true"`.  */
export const SelectComboBoxAutocomplete: Story = {
  render: args => <SelectComboBoxAutocompleteC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};
