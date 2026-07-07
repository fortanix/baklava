/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorBright, fruits } from '../../../util/storybook/StorybookUtils.tsx';
import { loremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { MenuList } from './MenuList.tsx';


const notifyAction = (title: string) => () => { notify.info(`Activated the ${title}`); };
const propsAction = { onPress: notifyAction('action button') } as const;
const propsRadio = { selectionType: 'radio', onRequestSelected: notifyAction('option') } as const;
const propsCheckbox = { selectionType: 'checkbox', onRequestSelected: notifyAction('option') } as const;
const propsLink = {
  href: '#',
  onClick: (event: React.MouseEvent) => { event.preventDefault(); notifyAction('link')(); },
} as const;

type MenuListArgs = React.ComponentProps<typeof MenuList>;
type Story = StoryObj<MenuListArgs>;

export default {
  component: MenuList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu list',
    children: (
      <>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
      </>
    ),
  },
  render: (args) => <MenuList {...args}/>,
} satisfies Meta<MenuListArgs>;


export const MenuListStandard: Story = {};

export const MenuListEmpty: Story = {
  args: {
    children: null,
    empty: true,
  },
};

export const MenuListEmptyWithCustomPlaceholder: Story = {
  args: {
    children: null,
    empty: true,
    placeholderEmpty: <><Icon icon="user"/> No users to select</>,
  },
};

export const MenuListLoading: Story = {
  args: {
    children: (
      <>
        {fruits.slice(0, 2).map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
      </>
    ),
    status: 'loading',
  },
};

export const MenuListEmptyLoading: Story = {
  args: {
    children: null,
    empty: true,
    status: 'loading',
  },
};

export const MenuListShrink: Story = { args: { size: 'shrink' } };
export const MenuListSmall: Story = { args: { size: 'small' } };
export const MenuListMedium: Story = { args: { size: 'medium' } };
export const MenuListLarge: Story = { args: { size: 'large' } };

export const MenuListWithOverflow: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} label={loremIpsum()}/>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const MenuListWithGroups: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} selectionType="radio" label="No preference"/>
        <MenuList.Group label="Fruits 1">
          {fruits.slice(0, 5).map((fruit) =>
            <MenuList.Option {...propsRadio} key={fruit} selected={fruit === 'Cherry'} label={fruit}/>
          )}
        </MenuList.Group>
        <MenuList.Group label="Fruits 2">
          {fruits.slice(5, 10).map((fruit) =>
            <MenuList.Option {...propsRadio} key={fruit} selected={fruit === 'Melon'} label={fruit}/>
          )}
        </MenuList.Group>
      </>
    ),
  },
};

export const MenuListWithSegments: Story = {
  args: {
    children: (
      <>
        <MenuList.Segment sticky="start">
          <MenuList.Static>This item is in a sticky segment</MenuList.Static>
          <MenuList.Static>Scroll the list, and we should stick to the top</MenuList.Static>
        </MenuList.Segment>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
        <MenuList.Segment sticky="end">
          <MenuList.Static>This item is in a sticky segment</MenuList.Static>
          <MenuList.Static>Scroll the list, and we should stick to the bottom</MenuList.Static>
        </MenuList.Segment>
      </>
    ),
  },
};

export const MenuListWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <MenuList.Segment sticky="start">
        <MenuList.Static><InputSearch style={{ flexGrow: 1 }} placeholder="Search"/></MenuList.Static>
        </MenuList.Segment>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
        <MenuList.Segment sticky="end">
          <MenuList.Action {...propsAction} label="Footer action 1"/>
          <MenuList.Action {...propsAction} label="Footer action 2"/>
        </MenuList.Segment>
      </>
    ),
  },
};

export const MenuListWithHeaderAndFooterEmpty: Story = {
  args: {
    placeholderEmpty: <><Icon icon="user"/> No users to select</>,
    empty: true,
    children: (
      <>
        <MenuList.Segment sticky="start">
          <MenuList.Static><InputSearch style={{ flexGrow: 1 }} placeholder="Search"/></MenuList.Static>
        </MenuList.Segment>
        
        {/* FIXME: need to move this down to the bottom, even when there is an empty placeholder */}
        <MenuList.Segment sticky="end">
          <MenuList.Action {...propsAction} label="Footer action 1"/>
          <MenuList.Action {...propsAction} label="Footer action 2"/>
        </MenuList.Segment>
      </>
    ),
  },
};

export const MenuListWithRadioOptions: Story = {
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit} selected={fruit === 'Blueberry'}/>
        )}
      </>
    ),
  },
};

export const MenuListWithCheckboxOptions: Story = {
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <MenuList.Option {...propsCheckbox} key={fruit} label={fruit}
            selected={['Apple', 'Apricot', 'Melon', 'Orange'].includes(fruit)}
          />
        )}
      </>
    ),
  },
};

export const MenuListWithActions: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} label="Option 1"/>
        <MenuList.Option {...propsRadio} label="Option 2"/>
        <MenuList.Action {...propsAction} icon="edit" label="Action 1"/>
        <MenuList.Action {...propsAction} disabled icon="delete" label="Action 2 (disabled)"/>
      </>
    ),
  },
};

export const MenuListWithLinks: Story = {
  args: {
    children: (
      <>
        <MenuList.Link {...propsLink} href="#">This is a link</MenuList.Link>
        <MenuList.Link {...propsLink} href="#">This is another link</MenuList.Link>
        <MenuList.Group label="Group">
          <MenuList.Link {...propsLink} href="#">This link is in a group</MenuList.Link>
        </MenuList.Group>
      </>
    ),
  },
};

export const MenuListWithStaticContent: Story = {
  args: {
    children: (
      <>
        <MenuList.Static>Some static content</MenuList.Static>
        <MenuList.Static>This text should be selectable</MenuList.Static>
        <MenuList.Static>I can contain arbitrary content like icons: <Icon icon="bell"/></MenuList.Static>
        <MenuList.Group label="Group">
          <MenuList.Static>Static items can also be in a group</MenuList.Static>
        </MenuList.Group>
      </>
    ),
  },
};

/** When viewing the accessibility tree for this menu list, the accessible name should by "My menu list". */
export const MenuListWithVisibleLabel: Story = {
  args: {
    label: null,
    'aria-labelledby': 'my-label',
  },
  decorators: [
    Story => (
      <div>
        <span id="my-label">My menu list</span>
        <Story/>
      </div>
    ),
  ],
};

export const MenuListWithIcon: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} icon="account" label="Option with an icon"/>
        <MenuList.Option {...propsRadio} icon="user" label="Another option"/>
      </>
    ),
  },
};

export const MenuListWithHighlightedIcon: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} icon="account" iconDecoration="highlight" label="Option with an icon"/>
        <MenuList.Option {...propsRadio} icon="user" iconDecoration="highlight" label="Another option"/>
        <MenuList.Option {...propsRadio} icon="user" label="Without highlight (should line up)"/>
      </>
    ),
  },
};

const CustomIcon = (props: React.ComponentProps<typeof Icon>) =>
  <Icon
    {...props}
    style={{ color: colorBright, ...props.style }}
  />;
export const MenuListWithCustomIcon: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} Icon={CustomIcon} icon="account" label="Option with an icon"/>
        <MenuList.Option {...propsRadio} Icon={CustomIcon} icon="user" label="Another option"/>
      </>
    ),
  },
};

/** Disabled items should still be focusable. */
export const MenuListWithDisabledOption: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} label="This option is enabled"/>
        <MenuList.Option {...propsRadio} label="This option is disabled, but you can still focus me" disabled/>
        <MenuList.Option {...propsRadio} label="This option is enabled"/>
      </>
    ),
  },
};

export const MenuListDisabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <MenuList.Option {...propsRadio} label="All options should be disabled"/>
        <MenuList.Option {...propsRadio} label="Selecting me should do nothing"/>
      </>
    ),
  },
};
