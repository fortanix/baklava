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
  component: Select,
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

export const SelectWithAutoResize: Story = {
  args: {
    automaticResize: true,
    label: 'Test select',
    defaultSelected: 'long-option',
    formatItemLabel: (itemKey: ItemKey) => {
      if (itemKey === 'long-option') {
        return 'A very long option label to show automatic resizing';
      } else {
        return formatFruitLabel(itemKey);
      }
    },
    options: (
      <>
        <Select.Option key="long-option" itemKey="long-option"
          label="A very long option label to show automatic resizing"
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
        onSelect={setSelectedOption}
      />
    </>
  );
};
export const SelectControlled: Story = {
  render: args => <SelectControlledC {...args}/>,
};
export const SelectControlledWithDefault: Story = {
  render: args => <SelectControlledC {...args} defaultSelected="blueberry"/>,
};

type ExtendedFruitKey = FruitKey | 'lychee' | 'fig';

const formatExtendedFruitLabel = (
  option: null | ExtendedFruitKey,
  items: null | Partial<Record<ExtendedFruitKey, { label: string }>>
) => {
  let label: string = '';
  
  if (option) {
    if (items) {
      label = items[option]?.label ?? '';
    }
    
    if (!label) {
      label = formatFruitLabel(option) ?? '(none)';
    } 
  }
  
  return label;
};

const SelectControlledLazyC = ({ defaultSelected, ...props }: React.ComponentProps<typeof Select>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ExtendedFruitKey>(
    (defaultSelected as ExtendedFruitKey) ?? null
  );
  const [items, setItems] = React.useState<null | Partial<Record<ExtendedFruitKey, { label: string }>>>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setItems({ 'fig': { label: 'Fig' } });
      setSelectedOption('fig');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <p style={{ color: 'GrayText' }}>
        Wait for 2 seconds to see Selected label changing to Fig but Select component still displays Apple
      </p>
      <div>Selected: {formatExtendedFruitLabel(selectedOption, items)}</div>
      <Select
        {...props}
        placeholder="Choose a fruit"
        formatItemLabel={(itemKey: string) => formatExtendedFruitLabel(itemKey as ExtendedFruitKey, items)}
        options={Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <Select.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
        selected={selectedOption}
        // @ts-ignore FIXME: use generic to pass down `FruitKey` subtype?
        onSelect={setSelectedOption}
      />
    </>
  );
};

export const SelectControlledLazyWithDefault: Story = {
  render: args => <SelectControlledLazyC {...args} defaultSelected="apple"/>,
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
