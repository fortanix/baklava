/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, ComboBox } from './ComboBox.tsx';
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


type ComboBoxArgs = React.ComponentProps<typeof ComboBox>;
type Story = StoryObj<ComboBoxArgs>;

export default {
  component: ComboBox,
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
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
  render: (args) => <ComboBox {...args}/>,
} satisfies Meta<ComboBoxArgs>;

export const ComboBoxStandard: Story = {};

export const ComboBoxWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

const ComboBoxWithDefaultC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>('item-durian');
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const ComboBoxWithDefault: Story = {
  render: args => <ComboBoxWithDefaultC {...args}/>,
  args: {
  },
};


const ComboBoxControlledC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
      <div><Button label="Update state" onPress={() => { setSelectedKey('item-strawberry'); }}/></div>
    </>
  );
};
export const ComboBoxControlled: Story = {
  render: args => <ComboBoxControlledC {...args}/>,
  args: {
  },
};

const ComboBoxFullyControlledC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [value, setValue] = React.useState<string>('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);

  const onUpdateStatePress = () => {
    setSelectedKey('item-strawberry');
    setValue(props.dropdownProps?.formatItemLabel?.('item-strawberry') ?? '');
  };

  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        onBlur={(evt: React.FocusEvent<HTMLInputElement>) => {
          const value = evt.target.value;

          if (value === '') {
            setSelectedKey(null);
          } else if (selectedKey) {
            setValue(fruits[selectedKey as FruitKey] ?? '');
          }
        }}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
          if (selectedOption !== null) {
            setValue(selectedOption.label);
          }
        }}
      />
      <div><Button label="Update state" onPress={onUpdateStatePress}/></div>
    </>
  );
};
export const ComboBoxFullyControlled: Story = {
  render: args => <ComboBoxFullyControlledC {...args}/>,
  args: {
  },
};

const ComboBoxUncontrolledC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const ComboBoxUncontrolled: Story = {
  render: args => <ComboBoxUncontrolledC {...args}/>,
  args: {
  },
};

const ComboBoxWithFilterC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
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
export const ComboBoxWithFilter: Story = {
  render: args => <ComboBoxWithFilterC {...args}/>,
  args: {
  },
};

const ComboBoxInFormC = (props: React.ComponentProps<typeof ComboBox>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        console.log(event.currentTarget) 
        event.preventDefault();
        notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
      }}
    >
      <ComboBox {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </form>
  );
};
export const ComboBoxInForm: Story = {
  render: args => <ComboBoxInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    dropdownProps: {
      formatItemLabel: formatFruitLabel,
    },
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
const ComboBoxAutocompleteC = (props: Partial<React.ComponentProps<typeof ComboBox>>) => {
  const [value, setValue] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [blocks, setBlocks] = React.useState<Array<string>>([]);
  const pushBlock = (block: string) => { if (!blocks.includes(block)) setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); };
  
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  
  return (
    <ComboBox
      label="Test ComboBox"
      Input={InputSearch}
      placeholder="Choose your favorite fruits"
      value={value}
      onChange={event => { setValue(event.target.value); }}
      prefix={blocks.join(', ')}
      {...props}
      options={fruitsFiltered.map(([fruitKey, fruitName]) =>
        <ComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
      )}
      selected={selectedKey}
      onSelect={(selectedOptionKey, selectedOption) => {
        props.onSelect?.(selectedOptionKey, selectedOption);
        
        if (selectedOption !== null) {
          //To fill in the value in the input:
          //setValue(selectedOption.label);
          
          pushBlock(selectedOption.label);
          setValue('');
        }
        
        // Unset the selected state after a successful selection is made
        window.setTimeout(() => { setSelectedKey(null); }, 300);
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
export const ComboBoxAutocomplete: Story = {
  render: args => <ComboBoxAutocompleteC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};
