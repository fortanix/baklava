/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../components/actions/Button/Button.tsx';
import { Breadcrumbs } from '../AppLayout/Breadcrumbs/Breadcrumbs.tsx';
import { DummyBkLinkWithNotify } from '../../util/storybook/StorybookLink.tsx';

import { PageLayout } from './PageLayout.tsx';


type PageLayoutArgs = React.ComponentProps<typeof PageLayout>;
type Story = StoryObj<PageLayoutArgs>;

export default {
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: args => <PageLayout {...args}/>,
} satisfies Meta<PageLayoutArgs>;

const breadcrumbs1 = (
  <Breadcrumbs>
    <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Fortanix Armor"/>
    <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Dashboard" active/>
  </Breadcrumbs>
);
const title1 = 'Page Title';
const actions1 = (
  <>
    <Button kind="tertiary">Tertiary Button</Button>
    <Button kind="secondary">Secondary Button</Button>
    <Button kind="primary">Primary Button</Button>
  </>
);

const contentWithPageHeader = (
  <>
    <PageLayout.Header breadcrumbs={breadcrumbs1} title={title1}>
      {actions1}
    </PageLayout.Header>
    <PageLayout.Body>
      <p>Content Area. Notice this has no external padding on purpose; that's added by AppLayout.</p>
    </PageLayout.Body>
  </>
);

export const PageLayoutStandard: Story = {
  args: {
    children: contentWithPageHeader,
  },
};
