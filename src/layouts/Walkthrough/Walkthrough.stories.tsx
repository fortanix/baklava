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
import { Step, WalkThrough } from './Walkthrough.tsx';
import { AppLayout } from '../AppLayout/AppLayout';
import { Logo } from '../AppLayout/Logo/Logo';
import { Header } from '../AppLayout/Header/Header';
import { UserMenu } from '../AppLayout/Header/UserMenu';
import { SysadminSwitcher } from '../AppLayout/Header/SysadminSwitcher';
import { AccountSelector } from '../AppLayout/Header/AccountSelector';
import { SolutionSelector } from '../AppLayout/Header/SolutionSelector';
import { Sidebar } from '../AppLayout/Sidebar/Sidebar';
import { Nav } from '../AppLayout/Nav/Nav';
import { Breadcrumbs } from '../AppLayout/Breadcrumbs/Breadcrumbs';
import { ErrorBoundary } from 'react-error-boundary';
import { Banner } from '../../../dist/baklava';

const WALKTHROUGH_STEPS: Step[] = [
  {
    target: '.nav-item-overview',
    title: "Your Post Quantum Readiness",
    description: "See your PQC readiness score and vulnerabilities across all connections, keys, and services. See your PQC readiness score and vulnerabilities across all connections, keys, and services. See your PQC readiness score and vulnerabilities across all connections, keys, and services.",
    spotlightPadding: 20,
    disableScrolling: true,
    anchorOrigin:"left",
  },
  {
    target: '.open-modal-btn',
    title: "PQC Readiness at Different Levels",
    description: "Toggle between an organization-wide view or focus on an individual connection for deeper insights.",
    spotlightPadding: 20,
    disableScrolling: true,
    disableWait: true,
    anchorOrigin:"left",
  },
  // {
  //   target: '.pqc-vulnerability-card__visualization',
  //   title: "Identify Vulnerable Keys and Services",
  //   description: "Interactive visualization to trace vulnerabilities to their root causes, identifying specific keys, services, or resources requiring attention.",
  //   spotlightPadding: 20,
  //   disableScrolling: false,
  //   anchorOrigin:{
  //     horizontal:"right",
  //     vertical:"center"
  //   },
  // },
  // {
  //   target: '.pqc-vulnerability-card__info-panel',
  //   title: "All Critical Insights at a Glance",
  //   description: "Find all the critical details like Account/Subscription, Regions, Service Types, and Key Types for deeper analysis.",
  //   spotlightPadding: 20,
  //   disableScrolling: false,
  //   anchorOrigin:{
  //     horizontal:"left",
  //     vertical:"center"
  //   },
  // },
];



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
 decorators: [
    Story => (
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) =>
          <Banner variant="error" style={{ inlineSize: '60cqi' }}
            title="Error"
            actions={<Banner.ActionButton label="Reset" onPress={resetErrorBoundary}/>}
          >
            {error?.message}
          </Banner>
        }
      >
              <WalkThrough stepIndex={0} steps={WALKTHROUGH_STEPS} run={true} callback={()=>{}} />
              <Story />
      </ErrorBoundary>
    ),
  ],
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
        <AppLayout.Sidebar>
          <Sidebar className="bk-app-layout__sidebar">
            <Nav aria-label="Overview and assessment" /* If there are multiple `Nav`s, they must get unique labels */>
              <Nav.NavItem className="nav-item-overview" Link={DummyLink} active icon="dashboard" label="Overview" href="/dashboard"/>
              <Nav.NavItem Link={DummyLink} icon="badge-assessment" label="Assessment" href="/assessment"/>
              <Nav.NavItem Link={DummyLink} icon="services" label="Services" href="/services" disabled/>
            </Nav>
            <hr/>
            <Nav aria-label="Connections and policies">
              <Nav.NavItem Link={DummyLink} icon="cloud-accounts" label="Connections" href="/connections"/>
              <Nav.NavItem Link={DummyLink} icon="policy" label="Policy Center" href="/policy-center"/>
              <Nav.NavItem className="nav-authentication" Link={DummyLink} icon="user-authentication" label="Authentication" href="/authentication"/>
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
              trigger={({ activate }) => <Button className="open-modal-btn" kind="primary" label="Open modal" onPress={() => { activate(); }}/>}
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
