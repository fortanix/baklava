/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../../components/actions/Button/Button.tsx';
import { Input } from '../../../components/forms/controls/Input/Input.tsx';
import { Select } from '../../../components/forms/controls/Select/Select.tsx';

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
const CustomInput: React.ComponentProps<typeof Select>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
const projects = {
  p1: 'Connection/Project name',
  p2: 'Connection/Project name 2',
  p3: 'Connection/Project name 3',
};
const selectOptions = (
  Object.entries(projects).map(([projectKey, projectName]) =>
    <Select.Option key={projectKey} itemKey={projectKey} label={projectName}/>
  )
);
const title2 = (
  <Select
    label="Select project"
    placeholder="Select project"
    defaultSelected={projects.p1}
    options={selectOptions}
    Input={CustomInput}
  />
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

export const PageHeaderTitleScopeSwitcher: Story = {
  args: {
    titleSelect: title2,
    children: actions1,
  },
};
