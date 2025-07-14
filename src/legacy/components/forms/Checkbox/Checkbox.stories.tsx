/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './Checkbox.tsx';


type CheckboxArgs = React.ComponentProps<typeof Checkbox.Group>;
type Story = StoryObj<CheckboxArgs>;

const CheckboxGroupControlled = (props: Omit<CheckboxArgs, 'selectedValues' | 'onChange'>) => {
  const [selectedValues, setSelectedValues] = React.useState<Array<string>>(['checkbox-1']);
  return (
    <Checkbox.Group
      selectedValues={selectedValues}
      onChange={event => {
        const value = event.target.value;
        setSelectedValues(selectedValues => {
          if (selectedValues.includes(value)) {
            return selectedValues.filter(selectedValue => selectedValue !== value);
          } else {
            return [...selectedValues, value];
          }
        });
      }}
      {...props}
    />
  );
};

export default {
  component: Checkbox.Group,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: Array.from({ length: 3 }, (_, i) => i).map(index =>
      <Checkbox.Item key={index} label={`Checkbox ${index + 1}`} value={`checkbox-${index}`}/>
    ),
  },
  render: (args) => <CheckboxGroupControlled {...args}/>,
} satisfies Meta<CheckboxArgs>;


export const CheckboxStandard: Story = {};

export const CheckboxWithFocus: Story = {
  args: {
    children: Array.from({ length: 3 }, (_, i) => i).map(index =>
      <Checkbox.Item key={index} label={`Checkbox ${index + 1}`} value={`checkbox-${index}`}
        inputClassName={index === 1 ? 'pseudo-focus-visible' : ''}
      />
    ),
  },
};
