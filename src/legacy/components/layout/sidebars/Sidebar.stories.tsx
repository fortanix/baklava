/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import type { Meta, StoryObj } from '@storybook/react';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Nav, NavItem } from './Nav.tsx';

import { Sidebar } from './Sidebar.tsx';


type SidebarArgs = React.ComponentProps<typeof Sidebar>;
type Story = StoryObj<SidebarArgs>;

export default {
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Sidebar {...args}/>,
  decorators: [
    Story => <MemoryRouter><Story/></MemoryRouter>,
  ],
} satisfies Meta<SidebarArgs>;


export const SidebarStandard: Story = {
  args: {
    children: (
      <Nav>
        <NavItem key="dashboard" tooltip="Dashboard" to="/" active={false}>
          <BaklavaIcon icon="dashboard" className="title-icon"/>
          <span className="title">Dashboard</span>
          <span className="count">+2</span>
        </NavItem>
        <NavItem key="groups" tooltip="Groups" to="/" active={true}>
          <BaklavaIcon icon="group" className="title-icon"/>
          Groups
        </NavItem>
        <NavItem key="app" tooltip="Applications" to="/" active={false}>
          <BaklavaIcon icon="app" className="title-icon"/>
          Applications
        </NavItem>
        <NavItem key="user" tooltip="Users" to="/" active={false}>
          <BaklavaIcon icon="user" className="title-icon"/>
          Users
        </NavItem>
      </Nav>
    ),
  },
};
