/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Input } from '../Input/Input.tsx';

import { type ItemKey, SelectMulti } from './SelectMulti.tsx';


type SelectMultiArgs = React.ComponentProps<typeof SelectMulti>;
type Story = StoryObj<SelectMultiArgs>;

// Sample options
const fruits = {
  apple: 'Apple',
  apricot: 'Apricot',
  blueberry: 'Blueberry',
  cherry: 'Cherry',
  durian: 'Durian',
  jackfruit: 'Jackfruit',
  melon: 'Melon',
  mango: 'Mango',
  mangosteen: 'Mangosteen',
  orange: 'Orange',
  peach: 'Peach',
  pineapple: 'Pineapple',
  razzberry: 'Razzberry',
  strawberry: 'Strawberry',
};
type FruitKey = keyof typeof fruits;
const formatFruitLabel = (itemKey: ItemKey): string => fruits[itemKey as FruitKey] ?? 'UNKNOWN';

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
    formatItemLabel: formatFruitLabel,
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
  render: (args) => <SelectMulti {...args}/>,
} satisfies Meta<SelectMultiArgs>;


export const SelectMultiStandard: Story = {};

export const SelectMultiWithDefault: Story = {
  args: {
    defaultSelected: new Set(['blueberry', 'cherry', 'melon']),
  },
};

const CustomInput: React.ComponentProps<typeof SelectMulti>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
export const SelectMultiWithCustomInput: Story = {
  args: {
    Input: CustomInput,
  },
};
export const SelectMultiWithCustomInputAndDefault: Story = {
  args: {
    Input: CustomInput,
    defaultSelected: new Set(['blueberry', 'cherry', 'melon']),
  },
};

export const SelectMultiInScrollContainer: Story = {
  decorators: [
    Story => <div style={{ blockSize: '200vb', paddingBlockStart: '30vb' }}><Story/></div>,
  ],
};

export const SelectMultiWithAutoResize: Story = {
  args: {
    automaticResize: true,
    label: 'Test select',
    defaultSelected: new Set(['long-option']),
    formatItemLabel: (itemKey: ItemKey) => {
      if (itemKey === 'long-option') {
        return 'A very long option label to show automatic resizing';
      } else {
        return formatFruitLabel(itemKey);
      }
    },
    options: (
      <>
        <SelectMulti.Option key="long-option" itemKey="long-option"
          label="A very long option label to show automatic resizing"
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
};

const SelectMultiControlledC = ({ defaultSelected, ...props }: React.ComponentProps<typeof SelectMulti>) => {
  const [selectedOptions, setSelectedOptions] = React.useState<Set<ItemKey>>(defaultSelected ?? new Set());
  
  return (
    <>
      <div>Selected: {[...selectedOptions].map(key => formatFruitLabel(key as FruitKey)).join(', ')}</div>
      <SelectMulti
        {...props}
        placeholder="Choose some fruits"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <SelectMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedOptions}
        onSelect={setSelectedOptions}
      />
    </>
  );
};
export const SelectMultiControlled: Story = {
  render: args => <SelectMultiControlledC {...args}/>,
};
export const SelectMultiControlledWithDefault: Story = {
  render: args => <SelectMultiControlledC {...args} defaultSelected={new Set(['blueberry', 'cherry', 'mango'])}/>,
};

export const SelectMultiInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).getAll('story_component1[]') || 'none'}`);
          }}
        >
          <Story/>
        </form>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'story_component1',
  },
};
