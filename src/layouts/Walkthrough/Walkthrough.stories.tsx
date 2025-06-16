/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkUnstyled, DummyBkLinkWithNotify } from '../../util/storybook/StorybookLink.tsx';

import { WalkThrough, WalkThroughProps, Step } from './Walkthrough.tsx';
import { notify } from '../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { DialogModal } from '../../components/overlays/DialogModal/DialogModal.tsx';
import { Spinner } from '../../components/graphics/Spinner/Spinner.tsx';
import { AppLayout } from '../AppLayout/AppLayout';
import { Header } from '../AppLayout/Header/Header';
import { UserMenu } from '../AppLayout/Header/UserMenu';
import { SysadminSwitcher } from '../AppLayout/Header/SysadminSwitcher';
import { AccountSelector } from '../AppLayout/Header/AccountSelector';
import { SolutionSelector } from '../AppLayout/Header/SolutionSelector';
import { Sidebar } from '../AppLayout/Sidebar/Sidebar';
import { Nav } from '../AppLayout/Nav/Nav';
import { Breadcrumbs } from '../AppLayout/Breadcrumbs/Breadcrumbs';
import { LoremIpsum } from '../../util/storybook/LoremIpsum.tsx';
import { Select } from '../../components/forms/controls/Select/Select.tsx';
import { Tag } from '../../components/text/Tag/Tag.tsx';
import { FortanixLogo } from '../../fortanix/FortanixLogo/FortanixLogo.tsx';

import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';
import { Banner } from '../../components/containers/Banner/Banner.tsx';


const WALKTHROUGH_STEPS: Step[] = [
  {
    target: '.walkthrough-item-1',
    title: "Step 1",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spotlightPadding: 20,
    disableScrolling: true,
    placement:"right",
  },
  {
    target: '.walkthrough-item-2',
    title: "Step 2",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spotlightPadding: 20,
    disableScrolling: true,
    disableWait: true,
    placement:"right",
  },
  {
    target: '.walkthrough-item-3',
    title: "Step 3",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spotlightPadding: 20,
    disableScrolling: false,
    placement:"right",
  },
  {
    target: '.walkthrough-item-4',
    title: "Step 4",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spotlightPadding: 20,
    disableScrolling: false,
    placement:"right",
  },
];



type WalkThroughStoryProps = {
  children: React.ReactNode;
} & WalkThroughProps;

const WalkthroughStory = ({children, ...props}: WalkThroughStoryProps) => {
  return (
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
    <WalkThrough {...props} run={true} callback={()=>{}} />
    {children}
  </ErrorBoundary>
  );
}

type WalkthroughStoryArgs = React.ComponentProps<typeof WalkthroughStory>;
type Story = StoryObj<WalkthroughStoryArgs>;

export default {
  component: WalkthroughStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
  },
 render: 
    (args) => <WalkthroughStory {...args} />,
} satisfies Meta<WalkthroughStoryArgs>;


const header1 = (
  <AppLayout.Header>
    <DummyBkLinkUnstyled slot="logo">
      <FortanixLogo subtitle="Armor"/>
    </DummyBkLinkUnstyled>
    <Header slot="actions">
      <UserMenu userName="Anand Kashyap" className="walkthrough-item-4">
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
        <Nav.NavItem Link={DummyBkLinkUnstyled} className="walkthrough-item-1" active icon="dashboard" label="Overview" href="/dashboard"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="badge-assessment" label="Assessment" href="/assessment"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="services" label="Services" href="/services" disabled/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="dashboard" label="Activities" href="/activities"
          indicators={<Tag content="NEW"/>}
        />
      </Nav>
      <hr/>
      <Nav aria-label="Connections and policies">
        <Nav.NavItem Link={DummyBkLinkUnstyled} className="walkthrough-item-2" icon="cloud-accounts" label="Connections" href="/connections"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="policy" label="Policy Center" href="/policy-center"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="user-authentication" label="Authentication" href="/authentication"/>
      </Nav>
      <OverflowTester lines={45}/>
    </Sidebar>
  </AppLayout.Sidebar>
);

const content1 = (
  <AppLayout.Content>
    <Breadcrumbs>
      <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Fortanix Armor"/>
      <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Dashboard" active/>
    </Breadcrumbs>
    <Panel>
      <Panel.Heading>Panel</Panel.Heading>
      
      <DialogModal
        title="Modal"
        trigger={({ activate }) => <Button kind="primary" className="walkthrough-item-3" label="Open modal" onPress={() => { activate(); }}/>}
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

const footer1 = (
  <AppLayout.Footer>
    <span className="version">Version: 1.2.2343</span>
  </AppLayout.Footer>
);


export const Basic: Story = {
  args: {
    stepIndex: 0,
    steps: WALKTHROUGH_STEPS,
    children: (
      <AppLayout>
        {header1}
        {sidebar1}
        {content1}
        {footer1}
      </AppLayout>
    ),
  },
};


export const Scroll: Story = {
  args: {
    stepIndex: 0,
    steps: WALKTHROUGH_STEPS,
    children:(
      <div style={{ maxWidth: "70%", margin: "auto", marginTop: "20px" }}>
        <Panel style={{ maxHeight: '10lh'}}>
          <div className='walkthrough-item-1' style={{ marginBottom: '20px'}}>
            <Panel.Heading>Panel Heading 1</Panel.Heading>
            <LoremIpsum paragraphs={3}/>
          </div>
          <div className='walkthrough-item-2' style={{ marginBottom: '20px'}}>
            <Panel.Heading>Panel Heading 2</Panel.Heading>
            <LoremIpsum paragraphs={3}/>
          </div>
          <div className='walkthrough-item-3' style={{ marginBottom: '20px'}}>
            <Panel.Heading>Panel Heading 3</Panel.Heading>
            <LoremIpsum paragraphs={3}/>
          </div>
          <div className='walkthrough-item-4' style={{ marginBottom: '20px'}}>
            <Panel.Heading>Panel Heading 4</Panel.Heading>
            <LoremIpsum paragraphs={3}/>
          </div>
        </Panel>
      </div> 
    )
  }
}

const createLazyComponent = (index: number) => new Promise<{ default: React.ComponentType }>((resolve) => {
  setTimeout(() => {
    const Component = () => (
      <div className={`walkthrough-item-${index}`} style={{ marginBottom: '20px'}}>
        <Panel.Heading>Panel Heading {index}</Panel.Heading>
        <LoremIpsum paragraphs={3}/>
      </div>  
    );
    resolve({ default: Component });
  }, 3000*index); // simulate delay
})

const LazyComponentOne = React.lazy(() => createLazyComponent(1));
const LazyComponentTwo = React.lazy(() => createLazyComponent(2));
const LazyComponentThree = React.lazy(() => createLazyComponent(3));
const LazyComponentFour = React.lazy(() => createLazyComponent(4));

export const Lazy: Story = {
  args: {
    stepIndex: 0,
    steps: WALKTHROUGH_STEPS,
    children:( 
      <div style={{ maxWidth: "70%", margin: "auto", marginTop: "20px" }}>
          <Panel style={{ maxHeight: '30lh'}}>
            <React.Suspense fallback={<p>Waiting for Lazy Component 1<Spinner inline={true} /></p>}>
              <LazyComponentOne />
            </React.Suspense>
            <React.Suspense fallback={<p>Waiting for Lazy Component 2<Spinner inline={true} /></p>}>
              <LazyComponentTwo />
            </React.Suspense>
            <React.Suspense fallback={<p>Waiting for Lazy Component 3<Spinner inline={true} /></p>}>
              <LazyComponentThree />
            </React.Suspense>
            <React.Suspense fallback={<p>Waiting for Lazy Component 4<Spinner inline={true} /></p>}>
              <LazyComponentFour />
            </React.Suspense>
          </Panel>
      </div>
    )
  }
}
