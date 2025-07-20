/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from './Radio.tsx';


type RadioArgs = React.ComponentProps<typeof Radio.Group>;
type Story = StoryObj<RadioArgs>;

const RadioGroupControlled = (props: Omit<RadioArgs, 'selectedValues' | 'onChange'>) => {
  const [selectedValue, setSelectedValue] = React.useState<string>('radio-1');
  return (
    <Radio.Group
      selectedValue={selectedValue}
      onChange={event => {
        setSelectedValue(event.target.value);
      }}
      {...props}
    />
  );
};

const radioItems = Array.from({ length: 4 }, (_, i) => i).map(index =>
  <Radio.Item
    key={index}
    radioItemIndex={index}
    label={`Radio ${index + 1}`}
    value={`radio-${index}`}
    disabled={index === 2}
  />
);

const radioItemsWithPseudoFocus = Array.from({ length: 4 }, (_, i) => i).map(index =>
  <Radio.Item
    key={index}
    radioItemIndex={index}
    label={`Radio ${index + 1}`}
    value={`radio-${index}`}
    disabled={index === 2}
    className={index === 1 ? 'pseudo-focus-visible' : ''}
  />
);

export default {
  component: Radio.Group,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <RadioGroupControlled {...args}/>,
} satisfies Meta<RadioArgs>;


export const RadioStandard: Story = {
  args: {
    children: radioItems,
  },
};

export const RadioWithFocus: Story = {
  args: {
    children: radioItemsWithPseudoFocus,
  },
};

export const RadioInline: Story = {
  args: {
    children: radioItems,
    inline: true,
  },
};

export const RadioWithBorder: Story = {
  args: {
    children: radioItemsWithPseudoFocus,
    inline: true,
    radioWithBorder: true,
  },
};

export const RadioAsSwitcher: Story = {
  args: {
    children: radioItemsWithPseudoFocus,
    inline: true,
    radioSwitcher: true,
  },
};

export const RadioWithOptionsObject: Story = {
  args: {
    options: {
      'radio-1': { label: 'Radio 1' },
      'radio-2': { label: 'Radio 2 (disabled)', disabled: true },
      'radio-3': { label: 'Radio 3' },
    },
  },
};
