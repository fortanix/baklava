/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { MenuList } from '../MenuList/MenuList.tsx';

import { MenuListVirtual } from './MenuListVirtual.tsx';


type MenuListVirtualArgs = React.ComponentProps<typeof MenuListVirtual>;
type Story = StoryObj<MenuListVirtualArgs>;

const notifyAction = (title: string) => () => { notify.info(`Activated the ${title}`); };
const propsOption = { selectionMode: 'single', onRequestSelected: notifyAction('option') } as const;

const MenuListVirtualWithScrollContainer = (args: MenuListVirtualArgs) => {
  const [scrollElement, setScrollElement] = React.useState<null | HTMLDivElement>(null);
  return (
    <MenuList ref={el => { setScrollElement(el); }} label={null}>
      <style>{`
        @scope {
          overflow-y: auto;
          block-size: 30lh;
          inline-size: 25ch;
        }
      `}</style>
      <MenuListVirtual {...args} scrollContainer={{ current: scrollElement }}/>
    </MenuList>
  );
};

export default {
  component: MenuListVirtual,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <MenuListVirtualWithScrollContainer {...args}/>,
} satisfies Meta<MenuListVirtualArgs>;


export const MenuListVirtualStandard: Story = {
  args: {
    items: {
      count: 20,
      renderItem: (props, virtualItem) =>
        <MenuListVirtual.Option {...propsOption} {...props} label={`Option ${virtualItem.index + 1}`}/>,
      estimateSize: () => 37,
    },
  },
};

export const MenuListVirtualWithSegments: Story = {
  args: {
    items: [
      {
        count: 3,
        //segmentProps: { sticky: 'start' },
        renderItem: (props, virtualItem) =>
          <MenuListVirtual.Option key={virtualItem.key} {...propsOption} {...props}
            label={`Test ${virtualItem.index + 1}`}
          />,
        estimateSize: () => 37,
      },
      {
        count: 100,
        renderItem: (props, virtualItem) =>
          <MenuListVirtual.Option key={virtualItem.key} {...propsOption} {...props}
            label={`Option ${virtualItem.index + 1}`}
          />,
        estimateSize: () => 37,
      },
    ],
  },
};
