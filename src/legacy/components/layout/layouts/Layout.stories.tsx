/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import type { Meta, StoryObj } from '@storybook/react';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { H1 } from '../../typography/headings/Headings.tsx';
import { Button } from '../../buttons/Button.tsx';
import { Panel } from '../../containers/panel/Panel.tsx';

import { AccountSwitcher, HeaderGrid } from '../headers/HeaderGrid.tsx';
import { Sidebar } from '../sidebars/Sidebar.tsx';
import { Nav, NavItem } from '../sidebars/Nav.tsx';
import { Layout } from './Layout.tsx';


type LayoutArgs = React.ComponentProps<typeof Layout>;
type Story = StoryObj<LayoutArgs>;

export default {
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {},
  render: (args) => <Layout {...args}/>,
  decorators: [
    Story => <MemoryRouter><Story/></MemoryRouter>,
  ],
} satisfies Meta<LayoutArgs>;


export const LayoutStandard: Story = {
  args: {
    children: (
      <>
        <HeaderGrid>
          <AccountSwitcher className="account-switcher--account-selected"/>
          <div className="user-session">
            {/* TODO: convert to dropdown */}
            <Button plain className="user-info">
              <BaklavaIcon icon="user" className="icon-user"/>
              <span className="user-name">Anand Kashyap</span>
              <BaklavaIcon icon="arrow-expand" className="icon-dropdown"/>
            </Button>
            
            <div className="alerts">
              <BaklavaIcon icon="bell" className="icon"/>
              <span className="count">99+</span>
            </div>
          </div>
        </HeaderGrid>
        <Sidebar>
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
        </Sidebar>
        <div className="bkl bkl-content">
          <div className="bkl-content-wrapper">
            <div className="breadcrumbs">
              <ol>
                <li key="name">Anand Kashyap</li>
                <li key="groups">Groups</li>
              </ol>
            </div>
            
            <H1>Groups</H1>
            
            <Panel>
              Content
            </Panel>
          </div>
        </div>
      </>
    ),
  },
};
