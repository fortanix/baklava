/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, SelectComboBox } from './SelectComboBox.tsx';
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
    label: 'Test combobox',
    formatItemLabel: formatFruitLabel,
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
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

const SelectComboBoxWithDefaultC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>('item-durian');
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <SelectComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const SelectComboBoxWithDefault: Story = {
  render: args => <SelectComboBoxWithDefaultC {...args}/>,
  args: {
  },
};


const SelectComboBoxControlledC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <SelectComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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
export const SelectComboBoxControlled: Story = {
  render: args => <SelectComboBoxControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxFullyControlledC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [value, setValue] = React.useState<string>('');
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const onUpdateStatePress = () => {
    setSelectedKey('item-strawberry');
    setValue(props.dropdownProps?.formatItemLabel?.('item-strawberry') ?? '');
  };

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIsDropdownOpen(true);
    const newValue = evt.target.value;
    if (newValue === '') { setSelectedKey(null); }
    setValue(newValue);
  };

  const onBlur = () => {
    if (selectedKey) {
      setValue(fruits[selectedKey as FruitKey] ?? '');
    }
  };

  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <SelectComboBox
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
          if (selectedOption !== null) {
            setValue(selectedOption.label);
          }
          setIsDropdownOpen(false);
        }}
        dropdownProps={{
          ...props.dropdownProps,
          open: isDropdownOpen,
          onOpenChange: setIsDropdownOpen,
          onBlur,
        }}
      />
      <div><Button label="Update state" onPress={onUpdateStatePress}/></div>
    </>
  );
};
export const SelectComboBoxFullyControlled: Story = {
  render: args => <SelectComboBoxFullyControlledC {...args}/>,
  args: {
  },
};

const SelectComboBoxUncontrolledC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <SelectComboBox
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
        }}
      />
    </>
  );
};
export const SelectComboBoxUncontrolled: Story = {
  render: args => <SelectComboBoxUncontrolledC {...args}/>,
  args: {
  },
};

const SelectComboBoxWithFilterC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
      
  const fruitsFiltered = Object.entries(fruits)
    .filter(([_key, fruit]) => fruit.toLowerCase().includes((value ?? '').toLowerCase()));

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setIsDropdownOpen(true);
    const newValue = evt.target.value;
    if (newValue === '') { setSelectedKey(null); }
    setValue(newValue);
  };
  
  const onBlur = () => {
    if (selectedKey) {
      setValue(fruits[selectedKey as FruitKey] ?? '');
    }
  };

  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <SelectComboBox
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={fruitsFiltered.map(([fruitKey, fruitName]) =>
          <SelectComboBox.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedKey}
        onSelect={(_key, selectedOption) => {
          setSelectedKey(selectedOption?.itemKey ?? null);
          if (selectedOption !== null) {
            setValue(selectedOption.label);
          }
          setIsDropdownOpen(false);
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
export const SelectComboBoxWithFilter: Story = {
  render: args => <SelectComboBoxWithFilterC {...args}/>,
  args: {
  },
};

const SelectComboBoxInFormC = (props: React.ComponentProps<typeof SelectComboBox>) => {
  return (
    <form
      id="story-form"
      onSubmit={event => {
        console.log(event.currentTarget) 
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
    dropdownProps: {
      formatItemLabel: formatFruitLabel,
    },
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
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
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
export const SelectComboBoxAutocomplete: Story = {
  render: args => <SelectComboBoxAutocompleteC {...args}/>,
  args: {
    'aria-autocomplete': 'list',
  },
};
