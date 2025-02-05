/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';
import { Header } from './Header/Header.tsx';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Logo } from './Logo/Logo.tsx';
import { Nav } from './Nav/Nav.tsx';

import { Button } from '../../components/actions/Button/Button.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { DialogModal } from '../../components/overlays/DialogModal/DialogModal.tsx';
import { UserMenu } from './Header/UserMenu.tsx';

import { SolutionSelector } from './Header/SolutionSelector.tsx';
import { AccountSelector } from './Header/AccountSelector.tsx';
import { SysadminSwitcher } from './Header/SysadminSwitcher.tsx';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs.tsx';
import { AppLayout } from './AppLayout.tsx';


type AppLayoutArgs = React.ComponentProps<typeof AppLayout>;
type Story = StoryObj<AppLayoutArgs>;

export default {
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: args => <AppLayout {...args}/>,
} satisfies Meta<AppLayoutArgs>;


export const Standard: Story = {
  args: {
    children: (
      <>
        <header slot="header" className="bk-theme--dark">
          <Link unstyled href="#" slot="logo">
            <Logo subtitle="Data Security Manager" subtitleTrademark={true}/>
          </Link>
          <Header slot="actions">
            <UserMenu userName="Anand Kashyap"/>
            {/* <UserMenu userName="Anand Kashyap – Very Long Name That Will Overflow"/> */}
            <SysadminSwitcher className="select-action"/>
            <AccountSelector className="select-action"/>
            <SolutionSelector className="select-action"/>
          </Header>
        </header>
        {/* Container around the sidebar that grows to full height, allowing the sidebar to be sticky */}
        <div slot="sidebar" className="bk-theme--dark">
          <Sidebar className="bk-app-layout__sidebar">
            <Nav>
              <Nav.NavItem active icon="dashboard" label="Overview" href="#"/>
              <Nav.NavItem icon="badge-assessment" label="Assessment" href="#"/>
              <Nav.NavItem icon="services" label="Services" href="#"/>
            </Nav>
            <hr/>
            <Nav>
              <Nav.NavItem icon="cloud-accounts" label="Connections" href="#"/>
              <Nav.NavItem icon="policy" label="Policy Center" href="#"/>
              <Nav.NavItem icon="user-authentication" label="Authentication" href="#"/>
            </Nav>
            <OverflowTester lines={45}/>
          </Sidebar>
        </div>
        <main slot="content">
          <Breadcrumbs
            items={[
              {
                title: 'Data Security Manager',
                href: '#',
              },
              {
                title: 'Dashboard',
                href: '#',
              }
            ]}
          />
          <Panel>
            <Panel.Heading>Panel</Panel.Heading>
            
            <DialogModal
              title="Modal"
              trigger={({ activate }) => <Button kind="primary" label="Open modal" onPress={() => { activate(); }}/>}
            >
              Test
            </DialogModal>
          </Panel>
          <OverflowTester/>
        </main>
        <footer slot="footer">
          <span className="version">Version: 4.24.2343</span>
        </footer>
      </>
    ),
  },
};
