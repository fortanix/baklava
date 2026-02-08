/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { generateData } from '../../tables/util/generateData.ts'; // FIXME: move to a common location

import { Button } from '../../actions/Button/Button.tsx';

import { type ItemKey, type VirtualItemKeys, MenuMultiLazyProvider } from './MenuMultiLazyProvider.tsx';


type MenuMultiLazyProviderArgs = React.ComponentProps<typeof MenuMultiLazyProvider>;
type Story = StoryObj<MenuMultiLazyProviderArgs>;

const cachedVirtualItemKeys = (itemKeys: ReadonlyArray<ItemKey>): VirtualItemKeys => {
  const indicesByKey = new Map(itemKeys.map((itemKey, index) => [itemKey, index]));
  return {
    length: itemKeys.length,
    at: (index: number) => itemKeys.at(index),
    indexOf: (itemKey: ItemKey) => indicesByKey.get(itemKey) ?? -1,
  };
};
const generateItemKeys = (count: number) => Array.from({ length: count }, (_, i) => `test-${i}`);

export default {
  component: MenuMultiLazyProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu multi lazy provider',
    virtualItemKeys: cachedVirtualItemKeys(generateItemKeys(100)),
    limit: 5,
    onUpdateLimit: () => {},
    renderItem: item => generateData({ numItems: 1, seed: String(item.index) })[0]?.name,
    formatItemLabel: item => `Item ${item.split('-')[1]}`,
    children: ({ props, selectedOptions }) => {
      const selectedLabels = [...selectedOptions.values()].map(({ label }) => label).join(', ');
      return (
        <Button kind="primary" {...props()}>
          {selectedOptions.size > 0 ? `Selected: ${selectedLabels}` : 'Open dropdown'}
        </Button>
      );
    },
    onSelect: (selectedItemKey, selectedItem) => { console.log('Selected:', selectedItemKey, selectedItem); },
  },
  render: (args) => <MenuMultiLazyProvider {...args}/>,
} satisfies Meta<MenuMultiLazyProviderArgs>;

export const MenuMultiLazyProviderStandard: Story = {};

export const MenuMultiLazyProviderWithDefault: Story = {
  args: {
    defaultSelected: new Set(['test-3']),
  },
};

export const MenuMultiLazyProviderWithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, selectedOptions }) => (
      <Button kind="primary" {...props()}>
        {selectedOptions.size > 0
          ? `Selected: ${selectedOptions.size}`
          : 'Open dropdown placed to the right'
        }
      </Button>
    ),
  },
};

export const MenuMultiLazyProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const MenuMultiLazyProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const MenuMultiLazyProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuMultiLazyProviderControlledC = (props: React.ComponentProps<typeof MenuMultiLazyProvider>) => {
  const [selectedOptions, setSelectedOptions] = React.useState<Set<ItemKey>>(props.defaultSelected ?? new Set());
  const formatItemLabel = (item: string) => `Item ${item.split('-')[1]}`;
  
  return (
    <>
      <p>Selected: {[...selectedOptions].map(itemKey => formatItemLabel(itemKey)).join(', ') || '(none)'}</p>
      <MenuMultiLazyProvider
        {...props}
        selected={selectedOptions}
        onSelect={setSelectedOptions}
      />
      <div>
        <Button label="Update state"
          onPress={() => { setSelectedOptions(new Set(['test-2', 'test-3'])); }}
        />
      </div>
    </>
  );
};
export const MenuMultiLazyProviderControlled: Story = {
  render: args => <MenuMultiLazyProviderControlledC {...args}/>,
};
export const MenuMultiLazyProviderControlledWithDefault: Story = {
  render: args => <MenuMultiLazyProviderControlledC
    {...args}
    defaultSelected={new Set(['test-5', 'test-6', 'test-7'])}
  />,
};
