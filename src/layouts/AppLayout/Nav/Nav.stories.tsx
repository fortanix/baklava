/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkUnstyled } from '../../../util/storybook/StorybookLink.tsx';

import { Nav } from './Nav.tsx';


type LayoutArgs = React.ComponentProps<typeof Nav>;
type Story = StoryObj<LayoutArgs>;

export default {
  component: Nav,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: (
      <>
        <Nav.NavItem Link={DummyBkLinkUnstyled} active icon="dashboard" label="Overview" href="/dashboard"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="badge-assessment" label="Assessment" href="/assessment"/>
        <Nav.NavItem Link={DummyBkLinkUnstyled} icon="services" label="Services" href="/services" disabled/>
      </>
    ),
  },
  render: args => <Nav {...args}/>,
} satisfies Meta<LayoutArgs>;


export const NavStandard: Story = {};

const CustomIcon: React.ComponentProps<typeof Nav.NavItem>['Icon'] = ({ icon }) => <span>{icon}</span>;
export const NavItemWithCustomIcon: Story = {
  args: {
    children: (
      <Nav.NavItem Icon={CustomIcon} iconProps={{ icon: "🍕" }} label="Overview" href="/dashboard"/>
    ),
  },
};
