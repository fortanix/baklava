/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, ComboBox } from './ComboBox.tsx';


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
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <ComboBox.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
  render: (args) => <ComboBox {...args}/>,
} satisfies Meta<ComboBoxArgs>;


// Sample items
const fruits = [
  'Apple',
  'Apricot',
  'Blueberry',
  'Cherry',
  'Durian',
  'Jackfruit',
  'Melon',
  'Mango',
  'Mangosteen',
  'Orange',
  'Peach',
  'Pineapple',
  'Razzberry',
  'Strawberry',
];

export const ComboBoxStandard: Story = {};

export const ComboBoxWithCustomInput: Story = {
  args: {
    Input: InputSearch,
    placeholder: 'Search',
  },
};

const ComboBoxControlledC = (props: React.ComponentProps<typeof ComboBox>) => {
  const [value, setValue] = React.useState<undefined | string>();
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
      
  const fruitsFiltered = fruits.filter(fruit => fruit.toLowerCase().includes((value ?? '').toLowerCase()));
  
  return (
    <>
      <div>Input: {value ?? '(none)'}</div>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <ComboBox
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        options={fruitsFiltered.map(fruit =>
          <ComboBox.Option key={`option-${fruit}`} itemKey={`option-${fruit}`} label={fruit}/>
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
export const ComboBoxControlled: Story = {
  render: args => <ComboBoxControlledC {...args}/>,
  args: {
  },
};

const ComboBoxInFormC = (props: React.ComponentProps<typeof ComboBox>) => {
  return (
    <>
      <form
        id="story-form"
        onSubmit={event => {
          event.preventDefault();
          notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
        }}
      />
      <ComboBox {...props}/>
      <button type="submit" form="story-form">Submit</button>
    </>
  );
};
export const ComboBoxInForm: Story = {
  render: args => <ComboBoxInFormC {...args}/>,
  args: {
    form: 'story-form',
    name: 'story_component1',
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <ComboBox.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
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
  const pushBlock = (block: string) => { setBlocks(blocks => [...blocks, block]); };
  const popBlock = () => { setBlocks(blocks => blocks.slice(0, -1)); };
  
  const fruitsFiltered = fruits
    .filter(fruit => fruit.toLowerCase().includes((value ?? '').toLowerCase()))
    .filter(fruit => !blocks.includes(fruit));
  
  return (
    <ComboBox
      label="Test ComboBox"
      Input={InputSearch}
      placeholder="Choose your favorite fruits"
      value={value}
      onChange={event => { setValue(event.target.value); }}
      prefix={blocks.join(', ')}
      {...props}
      options={fruitsFiltered.map(fruit =>
        <ComboBox.Option key={`option-${fruit}`} itemKey={`option-${fruit}`} label={fruit}/>
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
