/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { ListBox, type ItemKey, type ItemDef, ListBoxContext } from './ListBox.tsx';


type ListBoxArgs = React.ComponentProps<typeof ListBox>;
type Story = StoryObj<ListBoxArgs>;

export default {
  component: ListBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test list box',
  },
  render: (args) => <ListBox {...args}/>,
} satisfies Meta<ListBoxArgs>;


export const ListBoxStandard: Story = {
  args: {
    children: (
      <>
        {['Apple', 'Apricot', 'Blueberry', 'Cherry', 'Melon', 'Orange', 'Strawberry'].map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxWithScroll: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 15 }).map((_, index) =>
          <ListBox.Option key={`option-${index + 1}`} itemKey={`option-${index + 1}`} label={`Option ${index + 1}`}/>
        )}
      </>
    ),
  },
};

/*
type ListBoxControlledProps = React.PropsWithChildren<Partial<ListBoxContext>>;
const ListBoxControlled = ({ children, ...listBoxContext }: ListBoxControlledProps) => {
  const [selectedItem, setSelectedItem] = React.useState<null | ItemKey>(null);
  const context: ListBoxContext = {
    selectedItem,
    selectItem: (option: ItemDef) => { setSelectedItem(option.itemKey); },
    close: () => {},
    ...listBoxContext,
  };
  
  return (
    <ListBoxContext value={context}>
      {children}
    </ListBoxContext>
  );
};

export const Standard: Story = {
  name: 'ListBox',
  decorators: [Story => <ListBoxControlled><Story/></ListBoxControlled>],
  args: {
    children: (
      <>
        <ListBox.Option optionKey="option-1" label="Option 1"/>
        <ListBox.Option optionKey="option-2" label="Option 2"/>
        <ListBox.Option optionKey="option-3" label="Option 3"/>
        <ListBox.Option optionKey="option-4" label="Option 4"/>
        <ListBox.Option optionKey="option-5" label="Option 5"/>
        <ListBox.Option optionKey="option-6" label="Option 6"/>
        <ListBox.Option optionKey="option-7" label="Option 7"/>
        <ListBox.Option optionKey="option-8" label="Option 8"/>
        <ListBox.Option optionKey="option-9" label="Option 9"/>
      </>
    ),
  },
};

export const WithActions: Story = {
  decorators: [Story => <ListBoxControlled><Story/></ListBoxControlled>],
  args: {
    children: (
      <>
        <ListBox.Action itemKey="action-1" icon="docs" label="Action 1" onActivate={() => {}}/>
        <ListBox.Action itemKey="action-2" icon="key-link" label="Action 2" onActivate={() => {}}/>
      </>
    ),
  },
};

export const WithActionsAndOptions: Story = {
  decorators: [Story => <ListBoxControlled><Story/></ListBoxControlled>],
  args: {
    children: (
      <>
        <ListBox.Option optionKey="option-1" label="Option 1"/>
        <ListBox.Option optionKey="option-2" label="Option 2"/>
        <ListBox.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => {}}/>
        <ListBox.Action itemKey="action-2" icon="delete" label="Action 2" onActivate={() => {}}/>
      </>
    ),
  },
};
*/
