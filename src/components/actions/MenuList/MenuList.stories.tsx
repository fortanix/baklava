/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorBright, fruits, generateUsers } from '../../../util/storybook/StorybookUtils.tsx';
import { loremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';

import { MenuList } from './MenuList.tsx';


const notifyAction = (title: string) => () => { notify.info(`Activated the ${title}`); };
const propsAction = { onPress: notifyAction('action button') } as const;
const propsRadio = { selectionMode: 'single', onRequestSelected: notifyAction('option') } as const;
const propsCheckbox = { selectionMode: 'multiple', onRequestSelected: notifyAction('option') } as const;
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
        {fruits.map(fruit =>
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
        {fruits.slice(0, 2).map(fruit =>
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
        {fruits.map(fruit =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
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
        {fruits.map(fruit =>
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

export const MenuListWithSegmentsDisabled: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} label="This option should be enabled"/>
        <MenuList.Segment disabled>
          <MenuList.Option {...propsRadio} label="This option should be disabled"/>
          <MenuList.Segment>
            <MenuList.Option {...propsRadio} label="This option should also be disabled"/>
          </MenuList.Segment>
          <MenuList.Segment disabled={false}>
            <MenuList.Option {...propsRadio} label="This option should be enabled"/>
          </MenuList.Segment>
        </MenuList.Segment>
      </>
    ),
  },
};

export const MenuListWithGroups: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} label="No preference"/>
        <MenuList.Group label="Flavor 1">
          {fruits.slice(0, 5).map(fruit =>
            <MenuList.Option {...propsRadio} key={fruit} selected={fruit === 'Cherry'} label={fruit}/>
          )}
        </MenuList.Group>
        <MenuList.Group label="Flavor 2">
          {fruits.slice(5, -2).map(fruit =>
            <MenuList.Option {...propsRadio} key={fruit} selected={fruit === 'Melon'} label={fruit}/>
          )}
        </MenuList.Group>
        <MenuList.Group label="Extra flavors (premium only)" disabled
          heading={<><Icon inline icon="star-empty"/> Extra flavors (premium only)</>}
        >
          {fruits.slice(-2).map(fruit =>
            <MenuList.Option {...propsCheckbox} key={fruit} label={fruit}/>
          )}
        </MenuList.Group>
      </>
    ),
  },
};

export const MenuListWithStaticItems: Story = {
  args: {
    role: 'none', // No menu items, so needs to have `role="none"`
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

/**
 * `MenuList.Static` is excluded from the `focusgroup`. When a tab stop is included in a static item, it becomes
 * a new intermediate tab stop that can be navigated to separately from the `focusgroup`. * In the following example,
 * notice that sequential (tab) navigation will go from the first options, to the input, to the last options.
 */
export const MenuListWithIntermediateTabStop: Story = {
  args: {
    size: 'shrink',
    children: (
      <>
        {fruits.slice(0, 4).map(fruit =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit} selected={fruit === 'Blueberry'}/>
        )}
        <MenuList.Static>
          <InputSearch placeholder="I am an intermediate tab stop" automaticResize/>
        </MenuList.Static>
        {fruits.slice(4, 8).map(fruit =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const MenuListWithRadioOptions: Story = {
  args: {
    children: (
      <>
        {fruits.map(fruit =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit} selected={fruit === 'Blueberry'}/>
        )}
      </>
    ),
  },
};

export const MenuListWithRadioOptionsDisabled: Story = {
  args: {
    children: (
      <>
        {fruits.map(fruit =>
          <MenuList.Option {...propsRadio} key={fruit} label={fruit} selected={fruit === 'Blueberry'}
            disabled={['Blueberry', 'Mango'].includes(fruit)}
          />
        )}
      </>
    ),
  },
};

export const MenuListWithCheckboxOptions: Story = {
  args: {
    children: (
      <>
        {fruits.map(fruit =>
          <MenuList.Option {...propsCheckbox} key={fruit} label={fruit}
            selected={['Apple', 'Apricot', 'Melon', 'Orange'].includes(fruit)}
            disabled={['Apricot', 'Blueberry'].includes(fruit)}
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

const iconHighlight: Partial<React.ComponentProps<typeof Icon>> = { decoration: { type: 'background-circle' } };
export const MenuListWithHighlightedIcon: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} icon="account" iconProps={iconHighlight} label="Option with an icon"/>
        <MenuList.Option {...propsRadio} icon="user" iconProps={iconHighlight} label="Another option"/>
        <MenuList.Option {...propsRadio} icon="user" label="Without highlight (should line up)"/>
      </>
    ),
  },
};

const CustomIcon = (props: Partial<React.ComponentProps<typeof Icon>>) =>
  <Icon icon="account" {...props} style={{ color: colorBright, ...props.style }}/>;
export const MenuListWithCustomIcon: Story = {
  args: {
    children: (
      <>
        <MenuList.Option {...propsRadio} icon={p => <CustomIcon {...p}/>} label="Option with a custom icon"/>
        <MenuList.Option {...propsRadio} icon={p => <CustomIcon {...p} icon="bell"/>} label="Another custom icon"/>
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

export const MenuListWithHeaderAndFooter: Story = {
  args: {
    style: { '--sticky-items-end': 2 },
    children: (
      <>
        <MenuList.Segment sticky="start">
          <MenuList.Static><InputSearch style={{ flexGrow: 1 }} placeholder="Search"/></MenuList.Static>
        </MenuList.Segment>
        {fruits.map(fruit =>
          <MenuList.Option {...propsCheckbox} key={fruit} label={fruit}/>
        )}
        <MenuList.Footer>
          <MenuList.Action {...propsAction} label="Footer action 1"/>
          <MenuList.Action {...propsAction} label="Footer action 2"/>
        </MenuList.Footer>
      </>
    ),
  },
};

export const MenuListWithHeaderAndFooterEmpty: Story = {
  args: {
    style: { '--sticky-items-end': 2 },
    placeholderEmpty: <><Icon icon="user"/> No users to select</>,
    empty: true,
    children: (
      <>
        <MenuList.Segment sticky="start">
          <MenuList.Static><InputSearch style={{ flexGrow: 1 }} placeholder="Search"/></MenuList.Static>
        </MenuList.Segment>
        
        <MenuList.Footer>
          <MenuList.Action {...propsAction} label="Footer action 1"/>
          <MenuList.Action {...propsAction} label="Footer action 2"/>
        </MenuList.Footer>
      </>
    ),
  },
};

export const MenuListWritingModeVertical: Story = {
  args: {
    style: { writingMode: 'vertical-rl' },
    size: 'small',
    children: (
      <>
        <MenuList.Option {...propsRadio} label="林檎"/>
        <MenuList.Option {...propsRadio} label="オレンジ"/>
        <MenuList.Option {...propsRadio} label="バナナ"/>
        <MenuList.Option {...propsRadio} label="苺"/>
        <MenuList.Option {...propsRadio} label="マンゴー"/>
        <MenuList.Option {...propsRadio} label="みかん"/>
        <MenuList.Option {...propsRadio} label="もも"/>
        <MenuList.Option {...propsRadio} label="メロン"/>
        <MenuList.Option {...propsRadio} label="梨"/>
      </>
    ),
  },
};

export const MenuListEmbedded: Story = {
  args: {
    embedded: true,
  },
};

/**
 * MenuList is built to handle a reasonably large list of items. CSS optimization on items is applied through
 * `content-visibility`, such that the browser skips painting items that are not currently relevant to the user.
 */
export const MenuListWithManyItems: Story = {
  args: {
    children: Array.from({ length: 1000 }, (_, i) => i + 1).map(index =>
      <MenuList.Option key={`option-${index}`} {...propsRadio}>
        {generateUsers({ numItems: 1, seed: String(index) })[0]?.name ?? ''}
        
        {/*
        Give later items a larger block size (compared to our `contain-intrinsic-block-size`), in order to test the
        `content-visibility` behavior in the browser. What should happen is: the scroll indicator should make a lot
        of progress at first but then get slower and slower as the browser starts calculating the actual elements.
        */}
        {index >= 80 && <span style={{ blockSize: '5lh' }}></span>}
        
        {/* Searchability test (CTRL/CMD+F). Should still work despite `content-visibility`. */}
        {index === 500 && <span>FIND ME</span>}
      </MenuList.Option>
    ),
  }
};
