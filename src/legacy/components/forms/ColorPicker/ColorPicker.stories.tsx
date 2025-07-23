/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ColorPicker } from './ColorPicker.tsx';


type ColorPickerArgs = React.ComponentProps<typeof ColorPicker.Group>;
type Story = StoryObj<ColorPickerArgs>;

const ColorPickerGroupControlled = (props: Omit<ColorPickerArgs, 'onChange'>) => {
  const [selectedColor, setSelectedColor] = React.useState<string>(props.selectedColor);
  return (
    <ColorPicker.Group
      {...props}
      selectedColor={selectedColor}
      onChange={color => {
        setSelectedColor(color);
      }}
    />
  );
};

export default {
  component: ColorPicker.Group,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: args => <ColorPickerGroupControlled {...args}/>,
} satisfies Meta<ColorPickerArgs>;


const defaultPreset = {
  'accentColor': '#007A8D',
  'neutralColor': '#7B5BA5',
  'brandColor': '#039ADC',
  'statusColor': '#f6a623',
};

export const ColorPickerStandard: Story = {
  args: {
    colorPreset: defaultPreset,
    selectedColor: 'forestgreen',
    onChange: () => {},
  },
};

export const ColorPickerWithCustomPreset: Story = {
  args: {
    colorPreset: { 'color-red': '#ff0000', 'color-green': '#00ff00', 'color-blue': '#0000ff' },
    selectedColor: 'yellow',
  },
  render: (args) => (
    <>
      <style>{`
        .color-red { background: red; }
        .color-green { background: green; }
        .color-blue { background: blue; }
      `}</style>
      <ColorPickerGroupControlled {...args}/>
    </>
  ),
};
