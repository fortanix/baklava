/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fruits } from '../../../util/storybook/StorybookUtils.tsx';
import { dummyLinkPropsWithNotify } from '../../../util/storybook/StorybookLink.tsx';

import { notify } from '../ToastProvider/ToastProvider.tsx';

import { Menu } from './Menu.tsx';


const notifyAction = (title: string) => () => { notify.info(`Activated the ${title}`); };
const propsAction = { onPress: notifyAction('action button') } as const;
const propsLink = dummyLinkPropsWithNotify;

type MenuArgs = React.ComponentProps<typeof Menu>;
type Story = StoryObj<MenuArgs>;

export default {
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Test menu',
  },
  render: (args) => <Menu {...args}/>,
} satisfies Meta<MenuArgs>;


export const MenuStandard: Story = {
  args: {
    children: (
      <>
        <Menu.Action {...propsAction} label="Action 1"/>
        <Menu.Action {...propsAction} label="Action 2"/>
        <Menu.Action {...propsAction} label="Action 3"/>
      </>
    ),
  },
};

export const MenuEmpty: Story = {
  args: {
    children: null,
    empty: true, // Must be determined manually by the consumer
  },
};

export const MenuActionsAndLinks: Story = {
  args: {
    children: (
      <>
        <Menu.Action {...propsAction} label="Action 1"/>
        <Menu.Action {...propsAction} label="Action 2"/>
        <Menu.Link {...propsLink} label="Link 1"/>
        <Menu.Link {...propsLink} label="Link 2"/>
      </>
    ),
  },
};

export const MenuWithSelect: Story = {
  args: {
    children: (
      <Menu.Select itemKey="group-single" label="Single-select group" defaultSelected="Apricot">
        {fruits.map(fruit =>
          <Menu.Select.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </Menu.Select>
    ),
  },
};

export const MenuWithSelectMulti: Story = {
  args: {
    children: (
      <>
        <Menu.Select itemKey="group-single" label="Single-select group" defaultSelected="single-2">
          <Menu.Select.Option itemKey="single-1" label="Option 1"/>
          <Menu.Select.Option itemKey="single-2" label="Option 2"/>
          <Menu.Select.Option itemKey="single-3" label="Option 3"/>
        </Menu.Select>
        <Menu.Action {...propsAction} label="Action"/>
        <Menu.SelectMulti itemKey="group-multi" label="Multiple-select group"
          defaultSelected={new Set(['multi-2', 'multi-3'])}
        >
          <Menu.SelectMulti.Option itemKey="multi-1" label="Option 1"/>
          <Menu.SelectMulti.Option itemKey="multi-2" label="Option 2"/>
          <Menu.SelectMulti.Option itemKey="multi-3" label="Option 3"/>
        </Menu.SelectMulti>
      </>
    ),
  },
};


const MenuWithRefC = (props: React.ComponentProps<typeof Menu>) => {
  const ref = React.useRef<React.ComponentRef<typeof Menu>>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current._bkFocusLast();
    }
  }, []);
  
  return <Menu {...props} ref={ref}/>;
};
export const MenuWithRef: Story = {
  render: args => <MenuWithRefC {...args}/>,
  args: {
    children: (
      <>
        <Menu.Select itemKey="group-single" label="Single-select group" defaultSelected="single-2">
          <Menu.Select.Option itemKey="single-1" label="Option 1"/>
          <Menu.Select.Option itemKey="single-2" label="Option 2"/>
          <Menu.Select.Option itemKey="single-3" label="Option 3"/>
        </Menu.Select>
        <Menu.Action {...propsAction} label="Action"/>
        <Menu.SelectMulti itemKey="group-multi" label="Multiple-select group"
          defaultSelected={new Set(['multi-2', 'multi-3'])}
        >
          <Menu.SelectMulti.Option itemKey="multi-1" label="Option 1"/>
          <Menu.SelectMulti.Option itemKey="multi-2" label="Option 2"/>
          <Menu.SelectMulti.Option itemKey="multi-3" label="Option 3"/>
        </Menu.SelectMulti>
      </>
    ),
  },
};
