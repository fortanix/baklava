
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { type SwitchProps, Switch } from './Switch.tsx';


type Story = StoryObj<SwitchProps>;
export default {
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    defaultChecked: true,
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Switch {...args}/>,
} satisfies Meta<SwitchProps>;


export const Checked: Story = {};

export const Unchecked: Story = {
  args: { defaultChecked: false },
};

export const NonactiveChecked: Story = {
  name: 'Nonactive (checked)',
  args: { nonactive: true, defaultChecked: true },
};

export const NonactiveUnchecked: Story = {
  name: 'Nonactive (unchecked)',
  args: { nonactive: true, defaultChecked: false },
};

export const DisabledChecked: Story = {
  name: 'Disabled (checked)',
  args: { disabled: true, defaultChecked: true },
};

export const DisabledUnchecked: Story = {
  name: 'Disabled (unchecked)',
  args: { disabled: true, defaultChecked: false },
};
