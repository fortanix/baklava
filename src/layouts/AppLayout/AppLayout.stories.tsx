/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyLink } from '../../util/storybook/StorybookLink.tsx';

import { notify } from '../../components/overlays/ToastProvider/ToastProvider.tsx';
import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { DialogModal } from '../../components/overlays/DialogModal/DialogModal.tsx';

import { Header } from './Header/Header.tsx';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Logo } from './Logo/Logo.tsx';
import { Nav } from './Nav/Nav.tsx';
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
        <AppLayout.Header>
          <DummyLink slot="logo">
            <Logo subtitle="Data Security Manager" subtitleTrademark={true}/>
          </DummyLink>
          <Header slot="actions">
            <UserMenu userName="Anand Kashyap">
              <UserMenu.Action itemKey="profile" label="Profile"
                onActivate={() => { notify.info(`Opening user profile.`); }}
              />
              <UserMenu.Action itemKey="sign-out" label="Sign out"
                onActivate={() => { notify.info(`Signing out.`); }}
              />
            </UserMenu>
            <SysadminSwitcher
              onPress={() => { notify.info(`Navigating to system administration panel.`); }}
            />
            <AccountSelector
              className="select-action"
              accounts={
                <>
                  {Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map(name =>
                    <AccountSelector.Option key={`acc_${name}`} itemKey={`acc_${name}`} icon="account" label={name}/>
                  )}
                  <AccountSelector.FooterActions>
                    <AccountSelector.Action itemKey="action_add-account" label="Add account"
                      onActivate={() => { notify.info(`Navigating to 'Add Account' page.`);  }}
                    />
                  </AccountSelector.FooterActions>
                </>
              }
            >
              {selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label}
            </AccountSelector>
            <SolutionSelector className="select-action">
              {['Identity & Access Management', 'Key Insight', 'Data Security Manager'].map(name =>
                <SolutionSelector.Option key={name} itemKey={name} icon="user" label={name}
                  onSelect={() => { notify.info(`Selected ${name}`); }}
                />
              )}
            </SolutionSelector>
          </Header>
        </AppLayout.Header>
        <AppLayout.Sidebar>
          <Sidebar className="bk-app-layout__sidebar">
            <Nav aria-label="Overview and assessment" /* If there are multiple `Nav`s, they must get unique labels */>
              <Nav.NavItem Link={DummyLink} active icon="dashboard" label="Overview" href="/dashboard"/>
              <Nav.NavItem Link={DummyLink} icon="badge-assessment" label="Assessment" href="/assessment"/>
              <Nav.NavItem Link={DummyLink} icon="services" label="Services" href="/services" disabled/>
            </Nav>
            <hr/>
            <Nav aria-label="Connections and policies">
              <Nav.NavItem Link={DummyLink} icon="cloud-accounts" label="Connections" href="/connections"/>
              <Nav.NavItem Link={DummyLink} icon="policy" label="Policy Center" href="/policy-center"/>
              <Nav.NavItem Link={DummyLink} icon="user-authentication" label="Authentication" href="/authentication"/>
            </Nav>
            <OverflowTester lines={45}/>
          </Sidebar>
        </AppLayout.Sidebar>
        <AppLayout.Content>
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
          
          {/* Clicking the link should scroll to the anchor, with enough top padding (`scroll-padding-top`) */}
          <DummyLink id="anchor">Anchor</DummyLink>
          <OverflowTester openDefault/>
          <a href="#anchor">Scroll to anchor</a>
        </AppLayout.Content>
        <AppLayout.Footer>
          <span className="version">Version: 1.2.2343</span>
        </AppLayout.Footer>
      </>
    ),
  },
};

export const NoSidebar: Story = {
  args: {
    children: (
      <>
        <AppLayout.Header>
          <DummyLink slot="logo">
            <Logo subtitle="Data Security Manager" subtitleTrademark={true}/>
          </DummyLink>
          <Header slot="actions">
            <UserMenu userName="Anand Kashyap">
              <UserMenu.Action itemKey="profile" label="Profile"
                onActivate={() => { notify.info(`Opening user profile.`); }}
              />
              <UserMenu.Action itemKey="sign-out" label="Sign out"
                onActivate={() => { notify.info(`Signing out.`); }}
              />
            </UserMenu>
            <SysadminSwitcher
              onPress={() => { notify.info(`Navigating to system administration panel.`); }}
            />
            <AccountSelector className="select-action">
              {Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map(name =>
                <AccountSelector.Option key={`account_${name}`} optionKey={`account_${name}`} icon="account"
                  label={name}
                  onSelect={() => { notify.info(`Selected ${name}`); }}
                />
              )}
              {/* TODO: make this sticky so it's visible even if there are a lot of accounts? */}
              <AccountSelector.Option key="action_add-account" optionKey="action_add-account" label="Add account"/>
            </AccountSelector>
            <SolutionSelector className="select-action">
              {['Identity & Access Management', 'Key Insight', 'Data Security Manager'].map(name =>
                <SolutionSelector.Option key={name} optionKey={name} icon="user" label={name}
                  onSelect={() => { notify.info(`Selected ${name}`); }}
                />
              )}
            </SolutionSelector>
          </Header>
        </AppLayout.Header>
        <AppLayout.Content>
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
          
          {/* Clicking the link should scroll to the anchor, with enough top padding (`scroll-padding-top`) */}
          <DummyLink id="anchor">Anchor</DummyLink>
          <OverflowTester openDefault/>
          <a href="#anchor">Scroll to anchor</a>
        </AppLayout.Content>
        <AppLayout.Footer>
          <span className="version">Version: 1.2.2343</span>
        </AppLayout.Footer>
      </>
    ),
  },
};
