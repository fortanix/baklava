/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { type SwitcherOptionKey, SwitcherButtons } from './Switcher.tsx';


type SwitcherButtonsArgs = React.ComponentProps<typeof SwitcherButtons>;
type Story = StoryObj<SwitcherButtonsArgs>;

const SwitcherButtonsControlledC = <O extends SwitcherOptionKey>(
  props: React.ComponentProps<typeof SwitcherButtons<O>>
) => {
  const [selected, setSelected] = React.useState<O>(props.selected);
  return (
    <SwitcherButtons {...props} selected={selected} onChange={setSelected}/>
  );
};

export default {
  component: SwitcherButtons,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <SwitcherButtonsControlledC {...args}/>,
} satisfies Meta<SwitcherButtonsArgs>;


export const SwitcherButtonsStandard: Story = {
  args: {
    selected: 'button-2',
    children: Array.from({ length: 4 }, (_, i) => i + 1).map(optionKey =>
      <SwitcherButtons.Button
        key={optionKey}
        optionKey={`button-${optionKey}`}
      >
        Option {optionKey}
      </SwitcherButtons.Button>
    ),
  },
};

export const SwitcherButtonsWithFocus: Story = {
  args: {
    selected: 'button-2',
    children: Array.from({ length: 4 }, (_, i) => i + 1).map(optionKey =>
      <SwitcherButtons.Button
        key={optionKey}
        optionKey={`button-${optionKey}`}
        className={optionKey === 3 ? 'pseudo-focus-visible' : null}
      >
        Option {optionKey}
      </SwitcherButtons.Button>
    ),
  },
};
