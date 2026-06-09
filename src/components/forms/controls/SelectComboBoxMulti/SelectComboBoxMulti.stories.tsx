/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, SelectComboBoxMulti } from './SelectComboBoxMulti.tsx';
import { Button } from '../../../actions/Button/Button.tsx';


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
const formatFruitLabel = (itemKey: ItemKey): string => fruits[itemKey as FruitKey] ?? 'UNKNOWN';

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
    label: 'Test combobox',
    formatItemLabel: formatFruitLabel,
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
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

const SelectComboBoxMultiWithDefaultC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set(['item-apple', 'item-durian']));
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <SelectComboBoxMulti
        label="Test SelectComboBox"
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        {...props}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKeys}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setSelectedKeys(selectedOptionKeys);
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiWithDefault: Story = {
  render: args => <SelectComboBoxMultiWithDefaultC {...args}/>,
  args: {},
};

const SelectComboBoxMultiControlledC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
      
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <SelectComboBoxMulti
        label="Test SelectComboBox"
        placeholder="Choose your favorite fruits"
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKeys}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setSelectedKeys(selectedOptionKeys);
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKeys(new Set(['item-strawberry'])); }}/></div>
    </>
  );
};
export const SelectComboBoxMultiControlled: Story = {
  render: args => <SelectComboBoxMultiControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiFullyControlledC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
  
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
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <SelectComboBoxMulti
        label="Test SelectComboBox"
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKeys}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setValue('');
          setSelectedKeys(selectedOptionKeys);
        }}
        dropdownProps={{
          ...props.dropdownProps,
          onBlur,
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKeys(new Set(['item-strawberry'])); }}/></div>
    </>
  );
};
export const SelectComboBoxMultiFullyControlled: Story = {
  render: args => <SelectComboBoxMultiFullyControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiUncontrolledC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(() => new Set<string>());
  
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <SelectComboBoxMulti
        label="Test SelectComboBox"
        placeholder="Choose your favorite fruits"
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setSelectedKeys(selectedOptionKeys);
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiUncontrolled: Story = {
  render: args => <SelectComboBoxMultiUncontrolledC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiwithFilterC = (props: Partial<React.ComponentProps<typeof SelectComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIsDropdownOpen(true);
    const newValue = evt.target.value;
    setValue(newValue); 
  };

  const onBlur = () => {
    setValue('');
  };

  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <SelectComboBoxMulti
        label="Test SelectComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <SelectComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKeys}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setSelectedKeys(selectedOptionKeys);
        }}
        dropdownProps={{
          ...props.dropdownProps,
          open: isDropdownOpen,
          onOpenChange: setIsDropdownOpen,
          onBlur,
        }}
      />
    </>
  );
};
export const SelectComboBoxMultiWithFilter: Story = {
  render: args => <SelectComboBoxMultiwithFilterC {...args}/>,
  args: {
  },
};

const SelectComboBoxMultiInFormC = (props: React.ComponentProps<typeof SelectComboBoxMulti>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        event.preventDefault();
        const selected = new FormData(event.currentTarget).getAll('controlledComboBoxMulti[]');
        notify.info(`You have chosen: ${selected.join(', ') || 'none'}`);
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
    name: 'controlledComboBoxMulti',
    dropdownProps: { formatItemLabel: (itemKey: string) => `Option ${itemKey.split('-')[1]}` },
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <SelectComboBoxMulti.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
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

