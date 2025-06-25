/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkUnstyled, DummyBkLinkWithNotify } from '../../util/storybook/StorybookLink.tsx';
import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';

import { notify } from '../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Tag } from '../../components/text/Tag/Tag.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { Input } from '../../components/forms/controls/Input/Input.tsx';
import { Select } from '../../components/forms/controls/Select/Select.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { DialogModal } from '../../components/overlays/DialogModal/DialogModal.tsx';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs/Breadcrumbs.tsx';
import { Tabs } from '../../components/navigation/Tabs/Tabs.tsx';
import { FortanixLogo } from '../../fortanix/FortanixLogo/FortanixLogo.tsx';
import { PageLayout } from '../PageLayout/PageLayout.tsx';

import { AccountSelector } from './Header/AccountSelector.tsx';
import { SolutionSelector } from './Header/SolutionSelector.tsx';
import { UserMenu } from './Header/UserMenu.tsx';
import { Header } from './Header/Header.tsx';
import { SysadminSwitcher } from './Header/SysadminSwitcher.tsx';
import { Nav } from './Nav/Nav.tsx';
import { Sidebar } from './Sidebar/Sidebar.tsx';
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

const actions1 = (
  <>
    <Button kind="tertiary">Tertiary Button</Button>
    <Button kind="secondary">Secondary Button</Button>
    <Button kind="primary">Primary Button</Button>
  </>
);

const title1 = (
  <PageLayout.Heading>Page Title</PageLayout.Heading>
);

const contentWithPageLayoutWithTitle = (
  <AppLayout.Content>
    <PageLayout>
      <PageLayout.Header title={title1}>
        {actions1}
      </PageLayout.Header>
      <PageLayout.Body>
        <p>Content Area</p>
      </PageLayout.Body>
    </PageLayout>
  </AppLayout.Content>
);

const CustomInput: React.ComponentProps<typeof Select>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
const projects = {
  p1: 'Connection/Project name',
  p2: 'Connection/Project name 2',
  p3: 'Connection/Project name 3',
};
const selectOptions = (
  Object.entries(projects).map(([projectKey, projectName]) =>
    <Select.Option key={projectKey} itemKey={projectKey} label={projectName}/>
  )
);
const title2 = (
  <PageLayout.ScopeSwitcher>
    <Select
      label="Select project"
      placeholder="Select project"
      defaultSelected={projects.p1}
      options={selectOptions}
      Input={CustomInput}
    />
  </PageLayout.ScopeSwitcher>
);

const contentWithPageLayoutWithSelect = (
  <AppLayout.Content>
    <PageLayout>
      <PageLayout.Header title={title2}>
        {actions1}
      </PageLayout.Header>
      <PageLayout.Body>
        <p>Content Area</p>
      </PageLayout.Body>
    </PageLayout>
  </AppLayout.Content>
);

type DefaultTabOption = {
  index: number,
  className?: string,
};
const defaultTabOptions: DefaultTabOption[] = [1,2,3,4].map(index => { 
  return { index };
});

type TabsArgs = React.ComponentProps<typeof Tabs>;
type TabWithTriggerProps = React.PropsWithChildren<Partial<TabsArgs>> & {
  options?: undefined | Array<DefaultTabOption>,
  defaultActiveTabKey?: undefined | string,
};
const TabWithTrigger = (props: TabWithTriggerProps) => {
  const { options = defaultTabOptions, defaultActiveTabKey, ...tabContext } = props;
  
  const [activeTabKey, setActiveTabKey] = React.useState<undefined | string>(defaultActiveTabKey);
  
  return (
    <Tabs onSwitch={setActiveTabKey} activeKey={activeTabKey} {...tabContext}>
      {options.map(tab =>
        <Tabs.Tab
          key={tab.index}
          data-label={`tab${tab.index}`}
          tabKey={`tab${tab.index}`}
          title={`Tab ${tab.index}`}
          render={() => <PageLayout.Body>Tab {tab.index} contents</PageLayout.Body>}
          className={tab.className}
        />
      )}
    </Tabs>
  );
};

// TODO: The defaultActiveTabKey option is not working atm
// See https://github.com/fortanix/baklava/issues/261
const tabs1 = (
  <TabWithTrigger defaultActiveTabKey="1" />
);

const contentWithPageLayoutWithTabs = (
  <AppLayout.Content>
    <PageLayout>
      <PageLayout.Header title={title1}>
        {actions1}
      </PageLayout.Header>
      {tabs1}
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

export const AppLayoutPageWithTitle: Story = {
  args: {
    children: (
      <>
        {header1}
        {sidebar1}
        {breadcrumbs1}
        {contentWithPageLayoutWithTitle}
        {footer1}
      </>
    ),
  },
};

export const AppLayoutPageWithSelect: Story = {
  args: {
    children: (
      <>
        {header1}
        {sidebar1}
        {breadcrumbs1}
        {contentWithPageLayoutWithSelect}
        {footer1}
      </>
    ),
  },
};

export const AppLayoutPageWithTabs: Story = {
  args: {
    children: (
      <>
        {header1}
        {sidebar1}
        {breadcrumbs1}
        {contentWithPageLayoutWithTabs}
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

