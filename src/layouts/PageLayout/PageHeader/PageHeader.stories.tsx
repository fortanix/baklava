/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../../components/actions/Button/Button.tsx';

import { PageHeader } from './PageHeader.tsx';


type PageHeaderArgs = React.ComponentProps<typeof PageHeader>;
type Story = StoryObj<PageHeaderArgs>;

export default {
  component: PageHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => (
    <PageHeader
      {...args}
      // dummy style to easily see the gap between elements
      style={{
        minWidth: 800,
      }}
    />
  ),
} satisfies Meta<PageHeaderArgs>;

const title1 = 'Page Title';
const actions1 = (
  <>
    <Button kind="tertiary">Tertiary Button</Button>
    <Button kind="secondary">Secondary Button</Button>
    <Button kind="primary">Primary Button</Button>
  </>
);

export const PageHeaderTitleAndActions: Story = {
  args: {
    title: title1,
    children: actions1,
  }
};

export const PageHeaderJustTitle: Story = {
  args: {
    title: title1,
  },
};

