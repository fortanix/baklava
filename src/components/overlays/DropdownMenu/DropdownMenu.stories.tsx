/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { DropdownMenu, type OptionKey, type OptionDef, DropdownMenuContext } from './DropdownMenu.tsx';


type DropdownMenuArgs = React.ComponentProps<typeof DropdownMenu>;
type Story = StoryObj<DropdownMenuArgs>;

export default {
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test dropdown',
  },
  render: (args) => <DropdownMenu {...args}/>,
} satisfies Meta<DropdownMenuArgs>;


type DropdownMenuControlledProps = React.PropsWithChildren<Partial<DropdownMenuContext>>;
const DropdownMenuControlled = ({ children, ...dropdownContext }: DropdownMenuControlledProps) => {
  const [selectedOption, setSelectedOption] = React.useState<null | OptionKey>(null);
  const context: DropdownMenuContext = {
    selectedOption,
    selectOption: (option: OptionDef) => { setSelectedOption(option.optionKey); },
    close: () => {},
    ...dropdownContext,
  };
  
  return (
    <DropdownMenuContext value={context}>
      {children}
    </DropdownMenuContext>
  );
};

export const Standard: Story = {
  name: 'DropdownMenu',
  decorators: [Story => <DropdownMenuControlled><Story/></DropdownMenuControlled>],
  args: {
    children: (
      <>
        <DropdownMenu.Option optionKey="option-1" label="Option 1"/>
        <DropdownMenu.Option optionKey="option-2" label="Option 2"/>
        <DropdownMenu.Option optionKey="option-3" label="Option 3"/>
        <DropdownMenu.Option optionKey="option-4" label="Option 4"/>
        <DropdownMenu.Option optionKey="option-5" label="Option 5"/>
        <DropdownMenu.Option optionKey="option-6" label="Option 6"/>
        <DropdownMenu.Option optionKey="option-7" label="Option 7"/>
        <DropdownMenu.Option optionKey="option-8" label="Option 8"/>
        <DropdownMenu.Option optionKey="option-9" label="Option 9"/>
      </>
    ),
  },
};

export const WithActions: Story = {
  decorators: [Story => <DropdownMenuControlled><Story/></DropdownMenuControlled>],
  args: {
    children: (
      <>
        <DropdownMenu.Action itemKey="action-1" icon="docs" label="Action 1" onActivate={() => {}}/>
        <DropdownMenu.Action itemKey="action-2" icon="key-link" label="Action 2" onActivate={() => {}}/>
      </>
    ),
  },
};

export const WithActionsAndOptions: Story = {
  decorators: [Story => <DropdownMenuControlled><Story/></DropdownMenuControlled>],
  args: {
    children: (
      <>
        <DropdownMenu.Option optionKey="option-1" label="Option 1"/>
        <DropdownMenu.Option optionKey="option-2" label="Option 2"/>
        <DropdownMenu.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => {}}/>
        <DropdownMenu.Action itemKey="action-2" icon="delete" label="Action 2" onActivate={() => {}}/>
      </>
    ),
  },
};
