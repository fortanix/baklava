/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Input } from '../Input/Input.tsx';

import { type ItemDetails, SelectMulti } from './SelectMulti.tsx';


type SelectMultiArgs = React.ComponentProps<typeof SelectMulti>;
type Story = StoryObj<SelectMultiArgs>;

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
  component: SelectMulti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test select',
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <SelectMulti.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
  render: (args) => <SelectMulti {...args}/>,
} satisfies Meta<SelectMultiArgs>;


export const SelectMultiStandard: Story = {};

const CustomInput: React.ComponentProps<typeof SelectMulti>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
export const SelectMultiWithCustomInput: Story = {
  args: {
    Input: CustomInput,
  },
};

export const SelectMultiInScrollContainer: Story = {
  decorators: [
    Story => <div style={{ blockSize: '200vb', paddingBlockStart: '30vb' }}><Story/></div>,
  ],
};

const SelectMultiControlledC = (props: React.ComponentProps<typeof SelectMulti>) => {
  const [selectedOption, setSelectMultiedOption] = React.useState<null | ItemDetails>(null);
  
  return (
    <>
      <div>SelectMultied: {selectedOption?.label ?? '(none)'}</div>
      <SelectMulti
        {...props}
        placeholder="Choose a fruit"
        options={fruits.map(fruit =>
          <SelectMulti.Option key={`option-${fruit}`} itemKey={`option-${fruit}`} label={fruit}/>
        )}
        selected={selectedOption?.itemKey ?? null}
        onSelect={(_key, details) => { setSelectMultiedOption(details); }}
      />
    </>
  );
};
export const SelectMultiControlled: Story = {
  render: args => <SelectMultiControlledC {...args}/>,
};

export const SelectMultiInForm: Story = {
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
          <SelectMulti.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
};
