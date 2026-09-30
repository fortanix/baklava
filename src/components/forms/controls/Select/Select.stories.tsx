/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Input } from '../Input/Input.tsx';

import { type SelectedState, Select } from './Select.tsx';
import { Button } from '../../../actions/Button/Button.tsx';


type SelectArgs = React.ComponentProps<typeof Select>;
type Story = StoryObj<SelectArgs>;

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
const formatFruitLabel = (itemKey: SelectedState): string => {
  if (itemKey === null) { return ''; }
  return fruits[itemKey as FruitKey] ?? 'UNKNOWN';
};

export default {
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test select',
    formatSelected: formatFruitLabel,
    options: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <Select.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
  render: (args) => <Select {...args}/>,
} satisfies Meta<SelectArgs>;


export const SelectStandard: Story = {};

export const SelectStandardWithDefault: Story = {
  args: {
    defaultSelected: 'blueberry',
  },
};

const CustomInput: React.ComponentProps<typeof Select>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
export const SelectWithCustomInput: Story = {
  args: {
    Input: CustomInput,
  },
};
export const SelectWithCustomInputAndDefault: Story = {
  args: {
    Input: CustomInput,
    defaultSelected: 'blueberry',
  },
};

export const SelectInScrollContainer: Story = {
  decorators: [
    Story => <div style={{ blockSize: '200vb', paddingBlockStart: '30vb' }}><Story/></div>,
  ],
};

export const SelectFixedLength: Story = {
  args: {
    automaticResize: false,
    label: 'Test select',
    defaultSelected: 'fixed-length',
    formatSelected: (itemKey: SelectedState) => {
      if (itemKey === 'fixed-length') {
        return 'Fixed length';
      } else {
        return formatFruitLabel(itemKey);
      }
    },
    options: (
      <>
        <Select.Option key="fixed-length" itemKey="fixed-length"
          label="Fixed length"
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <Select.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
};

const SelectControlledC = ({ defaultSelected, ...props }: React.ComponentProps<typeof Select>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | FruitKey>((defaultSelected as FruitKey) ?? null);
  
  return (
    <>
      <div>Selected: {selectedOption === null ? '(none)' : formatFruitLabel(selectedOption)}</div>
      <Select
        {...props}
        placeholder="Choose a fruit"
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <Select.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedOption}
        // @ts-ignore FIXME: use generic to pass down `FruitKey` subtype?
        onSelectedChange={setSelectedOption}
      />
      <p><Button label="Update state" onPress={() => { setSelectedOption('mango'); }}/></p>
    </>
  );
};
export const SelectControlled: Story = {
  render: args => <SelectControlledC {...args}/>,
};
export const SelectControlledWithDefault: Story = {
  render: args => <SelectControlledC {...args} defaultSelected="blueberry"/>,
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
    formatSelected: itemKey => itemKey?.replace('option-', 'Option ') ?? '(none)',
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <Select.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
};

export const SelectVirtualized: Story = {
  args: {
    formatSelected: itemKey => itemKey?.replace('option-', 'Option ') ?? '(none)',
    options: (
      <>
        <Select.Static muted>Virtualized list</Select.Static>
        <Select.SegmentVirtual
          items={{
            count: 10_000,
            renderItem: (props, { key, index }) =>
              <Select.Option key={key} itemKey={`option-${index + 1}`} {...props} label={`Option ${index + 1}`}/>
          }}
        />
      </>
    ),
  },
};
