/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link } from '../src/components/actions/Link/Link.tsx';
import { Icon } from '../src/components/graphics/Icon/Icon.tsx';
import { Panel } from '../src/components/containers/Panel/Panel.tsx';

import { Logo } from '../src/fortanix/Logo/Logo.tsx';
import { UserMenu } from '../src/layouts/AppLayout/Header/UserMenu.tsx';
import { AccountSelector } from '../src/layouts/AppLayout/Header/AccountSelector.tsx';
import { SolutionSelector } from '../src/layouts/AppLayout/Header/SolutionSelector.tsx';
import { Header } from '../src/layouts/AppLayout/Header/Header.tsx';
import { Sidebar } from '../src/layouts/AppLayout/Sidebar/Sidebar.tsx';
import { Nav } from '../src/layouts/AppLayout/Nav/Nav.tsx';
import { Breadcrumbs } from '../src/layouts/AppLayout/Breadcrumbs/Breadcrumbs.tsx';
import { AppLayout } from '../src/layouts/AppLayout/AppLayout.tsx';


export const Demo = () => {
  return (
    <AppLayout>
      <AppLayout.Header>
        <Link unstyled href="#" slot="logo">
          <Logo subtitle="Data Security Manager" subtitleTrademark={true}/>
        </Link>
        <Header slot="actions">
          <UserMenu userName="Anand Kashyap"/>
          {/* <UserMenu userName="Anand Kashyap – Very Long Name That Will Overflow"/> */}
          <AccountSelector className="select-action" accounts={null}>
            {accountSelected => accountSelected?.label ?? 'Accounts'}
          </AccountSelector>
          <SolutionSelector className="select-action" solutions={null}/>
        </Header>
      </AppLayout.Header>
      {/* Container around the sidebar that grows to full height, allowing the sidebar to be sticky */}
      <AppLayout.Sidebar>
        <Sidebar className="bk-app-layout__sidebar">
          <Nav>
            <Nav.NavItem active icon="dashboard" label="Dashboard" href="#"/>
            <Nav.NavItem icon="dashboard" label="Groups" href="#"/>
          </Nav>
        </Sidebar>
      </AppLayout.Sidebar>
      <AppLayout.Content>
        <Icon icon="accounts"/>
        
        <Breadcrumbs
          items={[
            {
              title: 'Fortanix Armor',
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
        </Panel>
      </AppLayout.Content>
      <AppLayout.Footer>
        <span className="version">Version: 1.2.2343</span>
      </AppLayout.Footer>
    </AppLayout>
  );
};
