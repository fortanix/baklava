/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkUnstyled, DummyBkLinkWithNotify } from '../../util/storybook/StorybookLink.tsx';

import { notify } from '../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { DialogModal } from '../../components/overlays/DialogModal/DialogModal.tsx';
import { FortanixLogo } from '../../fortanix/FortanixLogo/FortanixLogo.tsx';
import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { Select } from '../../components/forms/controls/Select/Select.tsx';
import { Tag } from '../../components/text/Tag/Tag.tsx';

import { AppLayout } from './AppLayout.tsx';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs.tsx';
import { Header } from './Header/Header.tsx';
import { UserMenu } from './Header/UserMenu.tsx';
import { SolutionSelector } from './Header/SolutionSelector.tsx';
import { AccountSelector } from './Header/AccountSelector.tsx';
import { SysadminSwitcher } from './Header/SysadminSwitcher.tsx';
import { Nav } from './Nav/Nav.tsx';
import { PageLayout } from '../PageLayout/PageLayout.tsx';
import { Sidebar } from './Sidebar/Sidebar.tsx';


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


const header1 = (
  <AppLayout.Header>
    <DummyBkLinkUnstyled slot="logo">
      <FortanixLogo subtitle="Armor"/>
    </DummyBkLinkUnstyled>
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
      <SolutionSelector className="select-action"
        solutions={
          ['Identity & Access Management', 'Key Insight', 'Armor'].map(name =>
            <SolutionSelector.Option key={name} itemKey={name} icon="user" label={name}
              onSelect={() => { notify.info(`Selected ${name}`); }}
            />
          )
        }
      />
    </Header>
  </AppLayout.Header>
);

const sidebar1 = (
  <AppLayout.Sidebar>
    <Sidebar className="bk-app-layout__sidebar">
      <Nav aria-label="Overview and assessment" /* If there are multiple `Nav`s, they must get unique labels */>
        <Nav.NavItem Link={DummyBkLinkUnstyled} active icon="dashboard" label="Overview" href="/dashboard"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="badge-assessment" label="Assessment" href="/assessment"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="services" label="Services" href="/services" disabled/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="dashboard" label="Activities" href="/activities"
          indicators={<Tag content="NEW"/>}
        />
      </Nav>
      <hr/>
      <Nav aria-label="Connections and policies">
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="cloud-accounts" label="Connections" href="/connections"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="policy" label="Policy Center" href="/policy-center"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="user-authentication" label="Authentication" href="/authentication"/>
      </Nav>
      <OverflowTester lines={45}/>
    </Sidebar>
  </AppLayout.Sidebar>
);

const breadcrumbs1 = (
  <AppLayout.Breadcrumbs>
    <Breadcrumbs>
      <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Fortanix Armor"/>
      <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Dashboard" active/>
    </Breadcrumbs>
  </AppLayout.Breadcrumbs>
);

const content1 = (
  <AppLayout.Content>
    <Panel>
      <Panel.Heading>Panel</Panel.Heading>
      
      <DialogModal
        title="Modal"
        trigger={({ activate }) => <Button kind="primary" label="Open modal" onPress={() => { activate(); }}/>}
      >
        Test modal
      </DialogModal>
      
      <Select
        label="Test select"
        placeholder="Test select"
        options={
          <>
            <Select.Option itemKey="option-1" label="Option 1">Option 1</Select.Option>
            <Select.Option itemKey="option-2" label="Option 2">Option 2</Select.Option>
            <Select.Option itemKey="option-3" label="Option 3">Option 3</Select.Option>
          </>
        }
      />
    </Panel>
    
    {/* Clicking the link should scroll to the anchor, with enough top padding (`scroll-padding-top`) */}
    <DummyBkLinkUnstyled id="anchor">Anchor</DummyBkLinkUnstyled>
    <OverflowTester openDefault/>
    <a href="#anchor">Scroll to anchor</a>
  </AppLayout.Content>
);

const contentWithPageLayout = (
  <AppLayout.Content>
    <PageLayout>
      <PageLayout.Header title="Page Title">
        <Button kind="tertiary">Tertiary Button</Button>
        <Button kind="secondary">Secondary Button</Button>
        <Button kind="primary">Primary Button</Button>
      </PageLayout.Header>
      <PageLayout.Body>
        <p>Content Area</p>
      </PageLayout.Body>
    </PageLayout>
  </AppLayout.Content>
);

const footer1 = (
  <AppLayout.Footer>
    <span className="version">Version: 1.2.2343</span>
  </AppLayout.Footer>
);

export const AppLayoutStandard: Story = {
  args: {
    children: (
      <>
        {header1}
        {sidebar1}
        {breadcrumbs1}
        {content1}
        {footer1}
      </>
    ),
  },
};

export const AppLayoutPage: Story = {
  args: {
    children: (
      <>
        {header1}
        {sidebar1}
        {breadcrumbs1}
        {contentWithPageLayout}
        {footer1}
      </>
    ),
  },
};

export const AppLayoutWithoutSidebar: Story = {
  args: {
    children: (
      <>
        {header1}
        {breadcrumbs1}
        {content1}
        {footer1}
      </>
    ),
  },
};

export const AppLayoutWithoutHeader: Story = {
  args: {
    children: (
      <>
        {sidebar1}
        {breadcrumbs1}
        {content1}
        {footer1}
      </>
    ),
  },
};

