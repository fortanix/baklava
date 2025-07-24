/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { MultiAssignerEager } from './MultiAssignerEager.tsx';


type StoryItem = { id: string, name: string }; // A dummy `Item` type

type MultiAssignerEagerArgs = React.ComponentProps<typeof MultiAssignerEager<StoryItem>>;
type Story = StoryObj<MultiAssignerEagerArgs>;

const MultiAssignerEagerControlledC = (props: MultiAssignerEagerArgs) => {
  return (
    <MultiAssignerEager {...props}/>
  );
};

export default {
  component: MultiAssignerEager,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <MultiAssignerEagerControlledC {...args}/>,
} satisfies Meta<MultiAssignerEagerArgs>;


export const MultiAssignerEagerStandard: Story = {
  args: {
    deriveKey: (item: StoryItem) => item.id,
    
    items: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ],
    assignedItemKeys: [],
    
    assignItem: itemKey => {},
    unassignItem: itemKey => {},
    
    renderItemDetails: itemKey => <>TODO</>,
    renderAssignedItemDetails: itemKey => <>TODO</>,
  },
};
