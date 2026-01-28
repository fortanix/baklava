/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, ComboBoxMulti } from './ComboBoxMulti.tsx';


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

type ComboBoxMultiArgs = React.ComponentProps<typeof ComboBoxMulti>;
type Story = StoryObj<ComboBoxMultiArgs>;

export default {
  component: ComboBoxMulti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test combobox',
    dropdownProps: {
      formatItemLabel: formatFruitLabel,
    },
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
  render: (args) => <ComboBoxMulti {...args}/>,
} satisfies Meta<ComboBoxMultiArgs>;

export const ComboBoxMultiStandard: Story = {};

export const ComboBoxMultiWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

const ComboBoxMultiWithDefaultC = (props: Partial<React.ComponentProps<typeof ComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set(['item-apple', 'item-durian']));
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <ComboBoxMulti
        label="Test ComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        {...props}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
export const ComboBoxMultiWithDefault: Story = {
  render: args => <ComboBoxMultiWithDefaultC {...args}/>,
  args: {},
};

const ComboBoxMultiControlledC = (props: Partial<React.ComponentProps<typeof ComboBoxMulti>>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
      
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <ComboBoxMulti
        label="Test ComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
export const ComboBoxMultiControlled: Story = {
  render: args => <ComboBoxMultiControlledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiFullyControlledC = (props: Partial<React.ComponentProps<typeof ComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
      
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <ComboBoxMulti
        label="Test ComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
export const ComboBoxMultiFullyControlled: Story = {
  render: args => <ComboBoxMultiFullyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiUncontrolledC = (props: Partial<React.ComponentProps<typeof ComboBoxMulti>>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(() => new Set<string>());
  
  return (
    <>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <ComboBoxMulti
        label="Test ComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        {...props}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        onSelect={(selectedOptionKeys, selectedOption) => {
          props.onSelect?.(selectedOptionKeys, selectedOption);
          setSelectedKeys(selectedOptionKeys);
        }}
      />
    </>
  );
};
export const ComboBoxMultiUncontrolled: Story = {
  render: args => <ComboBoxMultiUncontrolledC {...args}/>,
  args: {
  },
};

const ComboBoxMultiwithFilterC = (props: Partial<React.ComponentProps<typeof ComboBoxMulti>>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ItemKey>>(new Set());
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {[...selectedKeys].join(', ')}</div>
      <ComboBoxMulti
        label="Test ComboBox"
        Input={InputSearch}
        placeholder="Choose your favorite fruits"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        {...props}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <ComboBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
export const ComboBoxMultiWithFilter: Story = {
  render: args => <ComboBoxMultiwithFilterC {...args}/>,
  args: {
  },
};

const ComboBoxMultiInFormC = (props: React.ComponentProps<typeof ComboBoxMulti>) => {
  return (
    <>
      <form
        id="story-form"
        onSubmit={event => {
          event.preventDefault();
          notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
        }}
      />
      <ComboBoxMulti {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </>
  );
};
export const ComboBoxMultiInForm: Story = {
  render: args => <ComboBoxMultiInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    dropdownProps: { formatItemLabel: (itemKey: string) => `Option ${itemKey.split('-')[1]}` },
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <ComboBoxMulti.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
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

