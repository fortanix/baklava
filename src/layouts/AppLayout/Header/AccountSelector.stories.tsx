/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { AccountSelector } from './AccountSelector.tsx';


type AccountSelectorArgs = React.ComponentProps<typeof AccountSelector>;
type Story = StoryObj<AccountSelectorArgs>;

export default {
  component: AccountSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <AccountSelector {...args}/>,
} satisfies Meta<AccountSelectorArgs>;


export const AccountSelectorStandard: Story = {
  args: {
    accounts: (
      <>
        {Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map(name =>
          <AccountSelector.Option key={`account_${name}`} itemKey={`account_${name}`} icon="account"
            label={name}
            //onSelect={() => { notify.info(`Selected ${name}`); }}
          />
        )}
        <AccountSelector.FooterActions>
          <AccountSelector.Action itemKey="action_add-account" label="Add account" onActivate={() => {}}/>
        </AccountSelector.FooterActions>
      </>
    ),
    children: selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.replace(/^account_/, '')
  },
};
