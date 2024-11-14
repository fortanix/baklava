/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxGroup } from './CheckboxGroup.tsx';


type CheckboxGroupArgs = React.ComponentProps<typeof CheckboxGroup>;
type Story = StoryObj<CheckboxGroupArgs>;

const Color = ['Red', 'Green', 'Blue'] as const;
type Color = (typeof Color)[number];

export default {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => {
    const [selectedColors, setSelectedColors] = React.useState<Array<Color>>([]);
    const handleCheckboxChange = (color: Color) => {
      if (selectedColors.includes(color)) {
        setSelectedColors(selectedColors.filter(c => c !== color));
      } else {
        setSelectedColors([...selectedColors, color]);
      }
    };
    return (
      <CheckboxGroup {...args}>
        {Color.map(color =>
          <CheckboxGroup.CheckboxField
            key={color}
            label={color}
            checked={selectedColors.includes(color)}
            onChange={() => { handleCheckboxChange(color as Color); }}
          />
        )}
      </CheckboxGroup>
    );
  },
} satisfies Meta<CheckboxGroupArgs>;

export const CheckboxGroupVertical: Story = {};

export const CheckboxGroupHorizontal: Story = {
  args: {
    direction: 'horizontal',
  },
};
