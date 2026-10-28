/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';

import { type ItemKey, AccountSelector } from './AccountSelector.tsx';


type AccountSelectorArgs = React.ComponentProps<typeof AccountSelector>;
type Story = StoryObj<AccountSelectorArgs>;

export default {
  component: AccountSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [Story => <LayoutDecorator><Story/></LayoutDecorator>],
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
          <AccountSelector.Option key={`account_${name}`} itemKey={`account_${name}`} icon="account" label={name}/>
        )}
        <AccountSelector.FooterActions>
          <AccountSelector.Action itemKey="action_add-account" label="Add account" onActivate={() => {}}/>
        </AccountSelector.FooterActions>
      </>
    ),
    children: selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label,
  },
};

export const AccountSelectorWithOverflow: Story = {
  args: {
    accounts: (
      <>
        <AccountSelector.Option key="account_long" itemKey="account_long" icon="account" label={loremIpsumSentence}/>
        {Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map(name =>
          <AccountSelector.Option key={`account_${name}`} itemKey={`account_${name}`} icon="account" label={name}/>
        )}
        <AccountSelector.FooterActions>
          <AccountSelector.Action itemKey="action_add-account" label="Add account" onActivate={() => {}}/>
        </AccountSelector.FooterActions>
      </>
    ),
    children: selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label,
  },
};

const AccountSelectorControlledC = () => {
  const [selected, setSelected] = React.useState<null | ItemKey>('account_2');
  
  return (
    <AccountSelector
      selected={selected}
      onSelect={setSelected}
      formatItemLabel={accountKey => accountKey.replace('account_', 'Account ')}
      accounts={
        Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map((name, index) =>
          <AccountSelector.Option
            key={`account_${index + 1}`}
            itemKey={`account_${index + 1}`}
            icon="account"
            label={name}
          />
        )
      }
    >
      {selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label}
    </AccountSelector>
  );
};
export const AccountSelectorControlled: Story = {
  render: args => <AccountSelectorControlledC {...args}/>,
};

const CustomImage = (id: string) => () => (
  <img
    src={`https://picsum.photos/id/${id}/200/300`}
    // consumer should be responsible of providing a sensible styling
    style={{objectFit: 'cover', inlineSize: '1.3em', blockSize: '1.3em'}}
  />
);
const AccountSelectorControlledCustomImageC = () => {
  const [selected, setSelected] = React.useState<null | ItemKey>('account_2');
  
  return (
    <AccountSelector
      selected={selected}
      onSelect={setSelected}
      formatItemLabel={accountKey => accountKey.replace('account_', 'Account ')}
      selectedIcon={<img src={`https://picsum.photos/id/${(selected || '').replace('account_', '')}/200/300`}/>}
      accounts={
        Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map((name, index) =>
          <AccountSelector.Option
            key={`account_${index + 1}`}
            itemKey={`account_${index + 1}`}
            label={name}
            // TODO: `icon` should not be needed when a custom `Icon` is used.
            // Revisit this custom icon condition once this PR is merged:
            // https://github.com/fortanix/baklava/pull/686.
            Icon={CustomImage(name.replace('Account ', ''))}
            icon="account"
          />
        )
      }
    >
      {selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label}
    </AccountSelector>
  );
};
export const AccountSelectorControlledCustomImage: Story = {
  render: args => <AccountSelectorControlledCustomImageC {...args}/>,
};
