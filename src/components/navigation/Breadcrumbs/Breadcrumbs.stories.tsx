/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type NonUndefined } from '../../../util/types.ts';

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkWithNotify } from '../../../util/storybook/StorybookLink.tsx';
import { Link } from '../../../components/actions/Link/Link.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';

import { Breadcrumbs } from './Breadcrumbs.tsx';


type BreadcrumbsArgs = React.ComponentProps<typeof Breadcrumbs>;
type Story = StoryObj<BreadcrumbsArgs>;

const exampleBreadcrumbs1 = (
  <>
    <Breadcrumbs.Item href="/" label="Crumb 1"/>
    <Breadcrumbs.Item href="/" label="Crumb 2"/>
    <Breadcrumbs.Item href="/" label="Crumb 3"/>
    <Breadcrumbs.Item href="/" label="Crumb 4" active/>
  </>
);

export default {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: exampleBreadcrumbs1,
  },
  render: (args) => <Breadcrumbs {...args}/>,
} satisfies Meta<BreadcrumbsArgs>;


export const BreadcrumbsStandard: Story = {};

export const BreadcrumbsWithDisabled: Story = {
  args: {
    children: (
      <>
        <Breadcrumbs.Item href="/" label="Crumb 1"/>
        <Breadcrumbs.Item href="/" label="Crumb 2" disabled/>
        <Breadcrumbs.Item href="/" label="Crumb 3"/>
        <Breadcrumbs.Item href="/" label="Crumb 4" active/>
      </>
    ),
  },
};

type CustomLinkProps = React.ComponentProps<NonUndefined<React.ComponentProps<typeof Breadcrumbs.Item>['Link']>> & {
  customLabel: string,
};
const CustomLink = ({ customLabel, ...props }: CustomLinkProps) => <Link {...props}>{customLabel}</Link>;

type CustomButtonProps = React.ComponentProps<NonUndefined<React.ComponentProps<typeof Breadcrumbs.Item>['Link']>> & {
  customLabel: string,
};
const CustomButton = ({ className, customLabel, ...props }: CustomButtonProps) =>
  <Button unstyled className={className}>{customLabel}</Button>;

export const BreadcrumbsWithCustomLink: Story = {
  args: {
    children: (
      <>
        <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Notify"/>
        <Breadcrumbs.Item Link={DummyBkLinkWithNotify} href="/" label="Disabled" disabled/>
        <Breadcrumbs.Item Link={CustomLink} href="/" linkProps={{ customLabel: 'Custom label' }} label="Custom link"/>
        <Breadcrumbs.Item Link={CustomButton} href="/" linkProps={{ customLabel: 'Button' }} label="Button"/>
        <Breadcrumbs.Item href="/" label="Standard" active/>
      </>
    ),
  },
};
