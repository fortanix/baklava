/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { type User as TestUser, generateUsers } from '../../../util/storybook/StorybookUtils.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../Button/Button.tsx';
import { MenuList } from '../MenuList/MenuList.tsx';

import { type VirtualItem, type VirtualItemProps, MenuListVirtual } from './MenuListVirtual.tsx';


type MenuListProps = Omit<React.ComponentProps<typeof MenuList>, 'label'>;
type MenuListVirtualArgs = React.ComponentProps<typeof MenuListVirtual> & { menuListProps?: MenuListProps };
type Story = StoryObj<MenuListVirtualArgs>;

const notifyAction = (title: string) => () => { notify.info(`Activated the ${title}`); };
const propsOption = { selectionMode: 'single', onRequestSelected: notifyAction('option') } as const;
const optionSize = 37;
const renderStandardOption = (renderLabel: (virtualItem: VirtualItem) => string) =>
  (props: VirtualItemProps, virtualItem: VirtualItem) =>
    <MenuList.Option key={virtualItem.key} {...propsOption} {...props} label={renderLabel(virtualItem)}/>;

const MenuListScrollContainer = (props: MenuListProps) =>
  <MenuList {...props} label="Test menulist">
    <style>{`
      @scope {
        block-size: 30lh;
        inline-size: 25ch;
      }
    `}</style>
    {props.children}
  </MenuList>;
const MenuListVirtualWithScrollContainer = ({ menuListProps, ...args }: MenuListVirtualArgs) =>
  <MenuListScrollContainer {...menuListProps}>
    <MenuListVirtual {...args}/>
  </MenuListScrollContainer>;

export default {
  component: MenuListVirtual,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: args => <MenuListVirtualWithScrollContainer {...args}/>,
} satisfies Meta<MenuListVirtualArgs>;


export const MenuListVirtualStandard: Story = {
  args: {
    items: {
      count: 100,
      renderItem: renderStandardOption(({ index }) => `Option ${index + 1}`),
      estimateSize: () => optionSize,
    },
  },
};

export const MenuListVirtualEmpty: Story = {
  args: {
    menuListProps: { empty: true },
    items: [],
  },
};

export const MenuListVirtualLoading: Story = {
  args: {
    menuListProps: { status: 'loading' },
    items: [
      {
        count: 2,
        renderItem: renderStandardOption(({ index }) => `Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
      {
        count: 2,
        renderItem: renderStandardOption(({ index }) => `Another option ${index + 1}`),
        estimateSize: () => optionSize,
      },
    ],
  },
};

export const MenuListVirtualEmptyLoading: Story = {
  args: {
    menuListProps: { status: 'loading' },
    items: [],
  },
};

export const MenuListVirtualWithChunks: Story = {
  args: {
    items: [
      {
        count: 3,
        renderItem: renderStandardOption(({ index }) => `Chunk 1 – Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
      {
        count: 100,
        renderItem: renderStandardOption(({ index }) => `Chunk 2 – Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
    ],
  },
};

/**
 * Item keys must be unique within their chunk. Conflicts between keys (like below) should _not_ lead to a React
 * console warning.
 */
export const MenuListVirtualChunkKeysNoConflict: Story = {
  args: {
    items: [
      {
        count: 1,
        renderItem: renderStandardOption(() => 'Different chunk, same key'),
        estimateSize: () => optionSize,
        getItemKey: () => 'same-key',
      },
      {
        count: 1,
        renderItem: renderStandardOption(() => 'Different chunk, same key'),
        estimateSize: () => optionSize,
        getItemKey: () => 'same-key',
      },
    ],
  },
};

export const MenuListVirtualNested: Story = {
  args: {
    items: [
      {
        count: 1,
        renderItem: (props, virtualItem) =>
          <MenuListVirtual key={virtualItem.key} {...props} sticky="start"
            items={{
              count: 3,
              renderItem: renderStandardOption(({ index }) => `Nested option ${index + 1}`),
              estimateSize: () => optionSize,
            }}
          />,
        estimateSize: () => optionSize * 3,
      },
      {
        count: 100,
        renderItem: renderStandardOption(({ index }) => `Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
    ],
  },
};

/**
 * When scrolling down, the sticky group should remain rendered. Note: sticky positioned in virtual lists will not work
 * exactly as normal, they behave more like `position: fixed`. This is due to the nature of how virtual items are
 * positioned absolutely in the scroll container. But for headers/footers this can still be useful.
 */
export const MenuListVirtualNestedSticky: Story = {
  args: {
    items: [
      {
        count: 3,
        renderItem: renderStandardOption(({ index }) => `Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
      {
        count: 2,
        renderMode: 'always',
        renderItem: (props, virtualItem) =>
          <MenuList.Segment key={virtualItem.key} {...props} sticky="start"
            style={{
              ...props.style,
              transform: 'initial',
              marginBlockStart: virtualItem.start,
            }}
          >
            <MenuList.Option {...propsOption} label="Test"/>
            <MenuList.Option {...propsOption} label="Test"/>
            <MenuList.Option {...propsOption} label="Test"/>
          </MenuList.Segment>,
          /* <MenuListVirtual sticky="start"
            items={{
              count: 3,
              renderMode: 'always',
              renderItem: (props, virtualItem) =>
                <MenuList.Option key={virtualItem.key} {...propsOption} {...props}
                  label={`Sticky option ${virtualItem.index + 1}`}
                />,
              estimateSize: () => optionSize,
            }}
            // style={{
            //   ...props.style,
            //   transform: 'initial',
            //   marginBlockStart: virtualItem.start,
            // }}
          /> */
        estimateSize: () => optionSize * 3 + 1, // 3 items + 1px for the bottom border
      },
      {
        count: 100,
        renderItem: renderStandardOption(({ index }) => `Option ${index + 1}`),
        estimateSize: () => optionSize,
      },
    ],
  },
};


const MenuListVirtualInfiniteScrollC = (props: MenuListVirtualArgs) => {
  const pageSize = 20;
  const maxItems = 50; // Have a small maximum, so we can test reaching the end of the list
  
  //const [isLoading, setIsLoading] = React.useState(false); // Not needed here?
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<TestUser>>(() => generateUsers({ numItems: limit }));
  
  const hasMoreItems = items.length < maxItems;
  
  const handleNearEnd = React.useCallback(async () => {
    if (!hasMoreItems) { return; }
    
    // Load another page
    const limitUpdated = Math.min(limit + pageSize, maxItems);
    setLimit(limitUpdated);
    //setIsLoading(true);
    
    await new Promise(resolve => window.setTimeout(resolve, 1200)); // Simulate time delay
    
    //setIsLoading(false);
    setItems(generateUsers({ numItems: limitUpdated }));
  }, [limit, hasMoreItems]);
  
  return (
    <MenuListScrollContainer
      // Note: for infinite scrolling, it is a better UX to immediately show "loading", even before the "near end"
      // event triggers (so that the user doesn't scroll down _and then_ a split second later a loading indicator is
      // rendered below and the user has to scroll down even more to see it).
      status={hasMoreItems ? 'loading' : 'ready'}
    >
      <MenuListVirtual
        {...props}
        items={[
          {
            count: items.length,
            estimateSize: () => optionSize,
            renderItem: renderStandardOption(({ index }) => items[index]?.name ?? 'Unknown index'),
          },
          // XXX replaced by top-level `status="loading"`
          //{
          //  count: hasMoreItems ? 1 : 0, // Better UX to immediately show "loading", even before the "near end" event
          //  estimateSize: () => optionSize,
          //  renderItem: renderStandardOption(() => 'Loading...'),
          //},
          // XXX replaced with custom `MenuList.Static` element
          // {
          //   count: hasMoreItems ? 0 : 1,
          //   estimateSize: () => optionSize,
          //   renderItem: renderStandardOption(() => `You've reached the end!`),
          // },
        ]}
        onNearEnd={handleNearEnd}
      />
      {!hasMoreItems &&
        <MenuList.Static muted>🎊 You've reached the end!</MenuList.Static>
      }
    </MenuListScrollContainer>
  );
};
export const MenuListVirtualInfiniteScroll: Story = {
  render: args => <MenuListVirtualInfiniteScrollC {...args}/>,
};


const MenuListVirtualWithLoadMoreC = (props: MenuListVirtualArgs) => {
  const pageSize = 20;
  const maxItems = 50; // Have a small maximum, so we can test reaching the end of the list
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState<Array<TestUser>>(() => generateUsers({ numItems: limit }));
  
  const hasMoreItems = items.length < maxItems;
  
  const handleLoadMore = React.useCallback(async () => {
    if (!hasMoreItems) { return; }
    
    // Load another page
    const limitUpdated = Math.min(limit + pageSize, maxItems);
    setLimit(limitUpdated);
    setIsLoading(true);
    
    await new Promise(resolve => window.setTimeout(resolve, 1200)); // Simulate time delay
    
    setIsLoading(false);
    setItems(generateUsers({ numItems: limitUpdated }));
  }, [limit, hasMoreItems]);
  
  return (
    <MenuListScrollContainer
      status={isLoading ? 'loading' : 'ready'}
    >
      <MenuListVirtual
        {...props}
        items={[
          {
            count: items.length,
            estimateSize: () => optionSize,
            renderItem: renderStandardOption(({ index }) => items[index]?.name ?? 'Unknown index'),
          },
        ]}
      />
      {!isLoading && hasMoreItems &&
        <MenuList.Static><Button kind="primary" label="Load more" onPress={handleLoadMore}/></MenuList.Static>
      }
      {!isLoading && !hasMoreItems &&
        <MenuList.Static muted>🎊 You've reached the end!</MenuList.Static>
      }
    </MenuListScrollContainer>
  );
};
export const MenuListVirtualWithLoadMore: Story = {
  render: args => <MenuListVirtualWithLoadMoreC {...args}/>,
};
