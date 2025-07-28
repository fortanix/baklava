/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import { ContextMenuProvider, type ItemKey } from './ContextMenuProvider.tsx';

type ContextMenuProviderArgs = React.ComponentProps<typeof ContextMenuProvider>;
type Story = StoryObj<ContextMenuProviderArgs>;

// sample options
const options = {
  'item-edit': 'Edit',
  'item-delete': 'Delete',
};
type OptionsKey = keyof typeof options;
const formatOptionLabel = (itemKey: ItemKey): string => options[itemKey as OptionsKey] ?? 'UNKNOWN';

export default {
  component: ContextMenuProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    formatItemLabel: formatOptionLabel,
    items: (
      <>
        {Object.entries(options).map(([optionKey, optionName]) =>
          <ContextMenuProvider.Action
            key={optionKey}
            itemKey={optionKey}
            label={optionName}
            onActivate={() => console.log(optionKey)}
          />
        )}
      </>
    ),
    onSelect: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <ContextMenuProvider {...args}/>,
} satisfies Meta<ContextMenuProviderArgs>;

export const ContextMenuWithDefaultIconButton: Story = {};

export const ContextMenuWithAnotherIconButton: Story = {
  args: {
    icon: 'bell',
  },
};

export const ContextMenuWithACustomComponent: Story = {
  args: {
    children: (<button>click me</button>),
  },
};
