/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Input } from '../Input/Input.tsx';

import { type ItemKey, Select } from './Select.tsx';


type SelectArgs = React.ComponentProps<typeof Select>;
type Story = StoryObj<SelectArgs>;

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

export default {
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <Select.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
  render: (args) => <Select {...args}/>,
} satisfies Meta<SelectArgs>;


export const SelectStandard: Story = {
  args: {},
};

const CustomInput: React.ComponentProps<typeof Select>['Input'] = props =>
  <Input {...props} icon="bell" iconLabel="Bell"/>;
export const SelectWithCustomInput: Story = {
  args: {
    Input: CustomInput,
  },
};

const SelectControlledC = (props: React.ComponentProps<typeof Select>) => {
  const [selectedKey, setSelectedKey] = React.useState<null | ItemKey>(null);
  
  const fruitsFiltered = fruits.filter(fruit => fruit.toLowerCase().includes((value ?? '').toLowerCase()));

  return (
    <>
      <div>Selected: {selectedKey ?? '(none)'}</div>
      <Select
        {...props}
        placeholder="Choose a fruit"
        value={value}
        onChange={event => { setValue(event.target.value); }}
        options={fruitsFiltered.map(fruit =>
          <Select.Option key={`option-${fruit}`} itemKey={`option-${fruit}`} label={fruit}/>
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
export const SelectControlled: Story = {
  render: args => <SelectControlledC {...args}/>,
};

export const SelectInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'story_component1',
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <Select.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
};
