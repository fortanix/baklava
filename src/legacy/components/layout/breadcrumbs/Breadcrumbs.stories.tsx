/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyLink } from '../../../util/storybook/StoryBookLink.tsx';

import { Breadcrumbs } from './Breadcrumbs.tsx';


type BreadcrumbsArgs = React.ComponentProps<typeof Breadcrumbs>;
type Story = StoryObj<BreadcrumbsArgs>;

export default {
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Breadcrumbs {...args}/>,
} satisfies Meta<BreadcrumbsArgs>;

const breadcrumbs1 = Array.from({ length: 4 }, (_, i) => i).map(index => ({
  title: `Breadcrumb ${index}`,
}));

export const BreadcrumbsStandard: Story = {
  args: {
    children: (
      <>
        {breadcrumbs1.map(item => 
          <Breadcrumbs.Item key={item.title}>
            <DummyLink className="bkl-breadcrumbs__link">{item.title}</DummyLink>
          </Breadcrumbs.Item>
        )}
      </>
    ),
  },
};

export const BreadcrumbsWithFocus: Story = {
  args: {
    children: (
      <>
        {breadcrumbs1.map((item, index) => 
          <Breadcrumbs.Item key={item.title}>
            <DummyLink
              className={index === 1 ? 'bkl-breadcrumbs__link pseudo-focus-visible' : 'bkl-breadcrumbs__link' }
            >
              {item.title}
            </DummyLink>
          </Breadcrumbs.Item>
        )}
      </>
    ),
  },
};

export const BreadcrumbsWithoutTrailingSlash: Story = {
  args: {
    noTrailingSlash: true,
    children: (
      <>
        {breadcrumbs1.map(item => 
          <Breadcrumbs.Item key={item.title}>
            <DummyLink className="bkl-breadcrumbs__link">{item.title}</DummyLink>
          </Breadcrumbs.Item>
        )}
      </>
    ),
  },
};
