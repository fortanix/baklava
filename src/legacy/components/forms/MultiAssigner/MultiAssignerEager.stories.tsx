/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumSentence } from '../../../../util/storybook/LoremIpsum.tsx';
import { LayoutDecorator } from '../../../../util/storybook/LayoutDecorator.tsx';

import * as MultiAssigner from './assigner/MultiAssigner.tsx';
import { type ItemKey, MultiAssignerEager } from './MultiAssignerEager.tsx';


type DummyItem = { id: number, name: string, email: string }; // A dummy `Item` type

type MultiAssignerEagerArgs = React.ComponentProps<typeof MultiAssignerEager<DummyItem>>;
type Story = StoryObj<MultiAssignerEagerArgs>;

const MultiAssignerEagerControlledC = (props: MultiAssignerEagerArgs) => {
  const [assignedItemKeys, setAssignedItemKeys] = React.useState<Array<ItemKey>>(props.assignedItemKeys);
  
  const assignItem = React.useCallback((itemKey: ItemKey) => {
    setAssignedItemKeys(assignedItemKeys => [...assignedItemKeys, itemKey]);
  }, []);
  
  const unassignItem = React.useCallback((itemKey: ItemKey) => {
    setAssignedItemKeys(assignedItemKeys => {
      const set = new Set(assignedItemKeys);
      set.delete(itemKey);
      return [...set];
    });
  }, []);
  
  const renderItemDetails = React.useCallback((itemKey: ItemKey) => {
    const user = props.items.find(user => String(user.id) === itemKey);
    if (!user) { throw new Error(`Could not find item '${itemKey}'`); }
    return (
      <MultiAssigner.CardItem>
        <MultiAssigner.CardItemTitleWrapper>
          <MultiAssigner.CardItemTitle>{user.name}</MultiAssigner.CardItemTitle>
          <MultiAssigner.CardItemSubtitle>{user.email}</MultiAssigner.CardItemSubtitle>
        </MultiAssigner.CardItemTitleWrapper>
        <MultiAssigner.AssignButton itemKey={String(user.id)}/>
      </MultiAssigner.CardItem>
    );
  }, [props.items]);
  
  const renderAssignedItemDetails = React.useCallback((itemKey: ItemKey) => {
    const user = props.items.find(user => String(user.id) === itemKey);
    if (!user) { throw new Error(`Invalid itemKey ${itemKey}`); }
    return (
      <MultiAssigner.CardItem>
        <MultiAssigner.CardItemTitleWrapper>
          <MultiAssigner.CardItemTitle>{user.name}</MultiAssigner.CardItemTitle>
          <MultiAssigner.CardItemSubtitle>{user.email}</MultiAssigner.CardItemSubtitle>
        </MultiAssigner.CardItemTitleWrapper>
        <MultiAssigner.UnassignButton itemKey={String(user.id)}/>
      </MultiAssigner.CardItem>
    );
  }, [props.items]);
  
  return (
    <MultiAssignerEager
      {...props}
      assignedItemKeys={assignedItemKeys}
      assignItem={assignItem}
      unassignItem={unassignItem}
      renderItemDetails={renderItemDetails}
      renderAssignedItemDetails={renderAssignedItemDetails}
    />
  );
};

export default {
  component: MultiAssignerEager,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <MultiAssignerEagerControlledC {...args}/>,
  decorators: [
    Story => <LayoutDecorator size="x-large"><Story/></LayoutDecorator>,
  ],
} satisfies Meta<MultiAssignerEagerArgs>;


export const MultiAssignerEagerStandard: Story = {
  args: {
    items: Array.from({ length: 30 }, (_, i) => i + 1).map(id => ({
      id,
      name: `User ${id}`,
      email: [5, 6].includes(id) ? loremIpsumSentence : `user${id}@example.com`,
    })),
    assignedItemKeys: ['3', '4', '6', '20', '21', '22', '23', '24', '25', '26'],
    deriveKey: (item: DummyItem) => `${item.id}`,
  },
};
