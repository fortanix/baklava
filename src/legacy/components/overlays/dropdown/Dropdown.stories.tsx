/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../buttons/Button.tsx';

import { type DropdownItemProps, Dropdown } from './Dropdown.tsx';


type DropdownArgs = React.ComponentProps<typeof Dropdown>;
type Story = StoryObj<DropdownArgs>;

export default {
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Dropdown {...args}/>,
} satisfies Meta<DropdownArgs>;


const options1: Record<string, DropdownItemProps<string>> = {
  rest: { label: 'Rest API' },
  pkcs11: { label: 'PKCS#11' },
  jce: { label: 'JCE' },
  cng: { label: 'CNG' },
  kmip: { label: 'KMIP' },
};

export const DropdownStandard: Story = {
  args: {
    toggle: <Button primary>Open dropdown</Button>,
    children: Object.entries(options1).map(([key, { label }]) => (
      <Dropdown.Item key={key} value={key} onActivate={() => {}} isSelected={key === 'pkcs11'}>
        {label}
      </Dropdown.Item>
    )) 
  },
};

export const DropdownSecondary: Story = {
  args: {
    secondary: true,
    toggle: <Button primary>Open dropdown</Button>,
    children: Object.entries(options1).map(([key, { label }]) => (
      <Dropdown.Item key={key} value={key} onActivate={() => {}} isSelected={key === 'pkcs11'}>
        {label}
      </Dropdown.Item>
    )) 
  },
};
