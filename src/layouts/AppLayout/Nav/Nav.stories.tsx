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
    layout: 'fullscreen',
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
  render: () => <Nav/>,
} satisfies Meta<LayoutArgs>;


export const Standard: Story = {};
