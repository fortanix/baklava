/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { PlaceholderEmpty, PlaceholderEmptyAction } from './PlaceholderEmpty.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Link } from '../../actions/Link/Link.tsx';


type PlaceholderEmptyArgs = React.ComponentProps<typeof PlaceholderEmpty>;
type Story = StoryObj<PlaceholderEmptyArgs>;

export default {
  component: PlaceholderEmpty,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    title: 'No data to display',
  },
  render: (args) => <PlaceholderEmpty {...args}/>,
} satisfies Meta<PlaceholderEmptyArgs>;

const actions = (
  <PlaceholderEmptyAction>
    <Button variant="secondary">Button</Button>
    <Button variant="primary">Button</Button>
  </PlaceholderEmptyAction>
);

const subtitle = (
  <>
    In case there is a secondary text to be added withIn case 
    there is a secondary text to be added with <Link>Link</Link>
  </>
);

export const Standard: Story = {
  name: 'Standard',
  args: {},
};

export const StandardWithSubtitle: Story = {
  name: 'Standard with subtitle',
  args: {
    subtitle,
  },
};

export const StandardWithButtons: Story = {
  name: 'Standard with buttons',
  args: {
    actions,
  },
};

export const StandardWithSubtitleAndButtons: Story = {
  name: 'Standard with subtitle and buttons',
  args: {
    subtitle,
    actions,
  },
};

export const Small: Story = {
  name: 'Small',
  args: {
    size: 'small',
  },
};

export const SmallWithFolderIcon: Story = {
  name: 'Small with folder icon',
  args: {
    size: 'small',
    icon: 'folder',
  },
};

export const SmallWithFileIcon: Story = {
  name: 'Small with file icon',
  args: {
    size: 'small',
    icon: 'file',
  },
};

export const SmallWithFileErrorIcon: Story = {
  name: 'Small with file error icon',
  args: {
    size: 'small',
    icon: 'file-error',
  },
};
