/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx, { type Argument as ClassNameArgument } from 'classnames';
import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { OverflowTester } from '../../util/storybook/OverflowTester.tsx';
import { Header } from './Header/Header.tsx';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Logo } from './Logo/Logo.tsx';
import { Nav } from './Nav/Nav.tsx';

import { Button } from '../../components/actions/Button/Button.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { Modal } from '../../components/overlays/Modal/Modal.tsx';
import { UserMenu } from './Header/UserMenu.tsx';

import { AppLayout } from './AppLayout.tsx';
import { SolutionSelector } from './Header/SolutionSelector.tsx';
import { AccountSelector } from './Header/AccountSelector.tsx';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs.tsx';


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


type ModalWithTriggerProps = Omit<React.ComponentProps<typeof Modal>, 'active' | 'onClose'> & {
  triggerLabel?: string,
  content?: React.ComponentProps<typeof Modal>['children'],
};
const ModalWithTrigger = ({ triggerLabel = 'Open modal', content, ...modalProps }: ModalWithTriggerProps) => {
  const [active, setActive] = React.useState(false);
  const onClose = React.useCallback(() => { setActive(false); }, [setActive]);
  return (
    <>
      <Button variant="primary" onPress={() => { setActive(true); }}>{triggerLabel}</Button>
      <Modal children={content} {...modalProps} active={active} onClose={onClose}/>
    </>
  );
};

export const Standard: Story = {
  args: {
    children: (
      <>
        <header slot="header" className="bk-theme--dark">
          <Link unstyled href="#" slot="logo">
            <Logo/>
          </Link>
          <Header slot="actions">
            <UserMenu userName="Anand Kashyap"/>
            {/* <UserMenu userName="Anand Kashyap – Very Long Name That Will Overflow"/> */}
            <AccountSelector className="select-action"/>
            <SolutionSelector className="select-action"/>
          </Header>
        </header>
        {/* Container around the sidebar that grows to full height, allowing the sidebar to be sticky */}
        <div slot="sidebar" className="bk-theme--dark">
          <Sidebar className="bk-app-layout__sidebar">
            <Nav>
              <Nav.NavItem active icon="dashboard" label="Dashboard" href="#"/>
              <Nav.NavItem icon="dashboard" label="Groups" href="#"/>
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
            
            <ModalWithTrigger>
              <ModalWithTrigger/>
            </ModalWithTrigger>
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
