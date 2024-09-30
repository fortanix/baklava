/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs.tsx';


type BreadcrumbsArgs = React.ComponentProps<typeof Breadcrumbs>;
type Story = StoryObj<BreadcrumbsArgs>;

export default {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <Breadcrumbs {...args}/>,
} satisfies Meta<BreadcrumbsArgs>;

const defaultBreadcrumbsItems: BreadcrumbItem[] = [1,2,3,4].map(item => { 
  return {
    title: `Test${item}`,
    href: '#',
  }
});

const BaseStory: Story = {
  args: {},
  render: (args) => <Breadcrumbs {...args}/>,
};

export const StandardStory: Story = {
  ...BaseStory,
  name: 'Standard',
  args: { items: defaultBreadcrumbsItems },
};

export const StandardFocus: Story = {
  ...BaseStory,
  name: 'Standard [focus]',
  args: {
    items: defaultBreadcrumbsItems.map((item, index) => {
      if (index === 1) {
        return {
          ...item,
          className: 'pseudo-focus-visible',
        }
      }
      return item;
    }),
  }
};

export const StandardTrailingSlash: Story = {
  ...BaseStory,
  name: 'Standard [trailing slash]',
  args: { items: defaultBreadcrumbsItems, hasTrailingSlash: true },
};
