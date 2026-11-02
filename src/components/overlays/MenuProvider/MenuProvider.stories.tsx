/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { notify } from '../ToastProvider/ToastProvider.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Input } from '../../forms/controls/Input/Input.tsx';
import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';

import { type ItemKey, type MenuProviderRef, MenuProvider } from './MenuProvider.tsx';


type MenuProviderArgs = React.ComponentProps<typeof MenuProvider>;
type Story = StoryObj<MenuProviderArgs>;

// Sample options
const fruits = {
  'item-apple': 'Apple',
  'item-apricot': 'Apricot',
  'item-blueberry': 'Blueberry',
  'item-cherry': 'Cherry',
  'item-durian': 'Durian',
  'item-jackfruit': 'Jackfruit',
  'item-melon': 'Melon',
  'item-mango': 'Mango',
  'item-mangosteen': 'Mangosteen',
  'item-orange': 'Orange',
  'item-peach': 'Peach',
  'item-pineapple': 'Pineapple',
  'item-razzberry': 'Razzberry',
  'item-strawberry': 'Strawberry',
};
type FruitKey = keyof typeof fruits;
const formatFruitLabel = (itemKey: ItemKey): string => fruits[itemKey as FruitKey] ?? 'UNKNOWN';

export default {
  component: MenuProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test menu provider',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {selectedOption !== null ? `Selected: ${formatFruitLabel(selectedOption)}` : 'Open dropdown'}
      </Button>
    ),
    items: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <MenuProvider.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
    onSelectedChange: selectedOption => { console.log('Selected:', selectedOption); },
  },
  render: (args) => <MenuProvider {...args}/>,
} satisfies Meta<MenuProviderArgs>;

export const MenuProviderStandard: Story = {};

/** When using up/down arrow keys, focus should not change in the empty case (since there is focusable element). */
export const MenuProviderEmpty: Story = {
  args: {
    defaultSelected: null,
    items: null,
  },
};

export const MenuProviderWithDefault: Story = {
  args: {
    defaultSelected: 'item-blueberry',
  },
};

export const MenuProviderWithInput: Story = {
  args: {
    children: ({ props, selectedOption }) => (
      <Input {...props()}
        value={selectedOption !== null ? `Selected: ${formatFruitLabel(selectedOption)}` : 'Open dropdown'}
        onChange={() => {}}
      />
    ),
  },
};

export const MenuProviderWithInputMenuItem: Story = {
  args: {
    items: (
      <>
        <MenuProvider.Segment sticky="start">
          <InputSearch/>
        </MenuProvider.Segment>
        <MenuProvider.Static><input type="file"/></MenuProvider.Static>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuProvider.Option itemKey="option-2" label="Option 2"/>
      </>
    ),
  },
};

export const MenuProviderWithPlacement: Story = {
  args: {
    placement: 'right',
    children: ({ props, selectedOption }) => (
      <Button kind="primary" {...props()}>
        {typeof selectedOption !== 'undefined'
          ? `Selected: ${selectedOption ?? 'none'}`
          : 'Open dropdown placed to the right'
        }
      </Button>
    ),
  },
};

export const MenuProviderWithAction: Story = {
  args: {
    items: ({ close }) => (
      <>
        <MenuProvider.Option itemKey="option-1" label="Option 1"/>
        <MenuProvider.Option itemKey="option-2" label="Option 2"/>
        <MenuProvider.Action itemKey="action-close" onPress={close} label="Close">
          Close
        </MenuProvider.Action>
      </>
    ),
  },
};

export const MenuProviderWithClickTrigger: Story = {
  args: {
    triggerAction: 'click',
  },
};

export const MenuProviderWithFocusTrigger: Story = {
  args: {
    triggerAction: 'focus',
  },
};

export const MenuProviderWithHoverTrigger: Story = {
  args: {
    triggerAction: 'hover',
  },
};

const MenuProviderControlledC = ({ defaultSelected, ...props }: React.ComponentProps<typeof MenuProvider>) => {
  const [selectedOption, setSelectedOption] = React.useState<null | ItemKey>(defaultSelected ?? null);
  
  return (
    <>
      <p>Selected: {selectedOption === null ? '(none)' : formatFruitLabel(selectedOption)}</p>
      <MenuProvider
        {...props}
        selected={selectedOption}
        onSelectedChange={setSelectedOption}
      />
      <div><Button label="Update state" onPress={() => { setSelectedOption('item-strawberry'); }}/></div>
    </>
  );
};
export const MenuProviderControlled: Story = {
  render: args => <MenuProviderControlledC {...args}/>,
};
export const MenuProviderControlledWithDefault: Story = {
  render: args => <MenuProviderControlledC {...args} defaultSelected="item-blueberry"/>,
};


const MenuProviderWithRefC = (props: React.ComponentProps<typeof MenuProvider>) => {
  const ref = React.useRef<MenuProviderRef>(null);
  
  const logState = async () => {
    // Add a timeout so we have time to open the menu first after clicking the button
    await new Promise(resolve => window.setTimeout(resolve, 1000));
    
    const state = ref.current;
    if (!state) { notify.info(`No ref`); return; }
    notify.info(`Open = ${state.open}, Selected = ${state.selected ?? '(none)'}`);
  };
  const openMenu = () => {
    ref.current?.requestOpenChange({ open: true, forced: false });
  };
  const updateSelected = () => {
    ref.current?.requestSelectedChange('item-blueberry');
  };
  
  return (
    <>
      <p><Button label="Log state" onPress={logState}/></p>
      <MenuProvider {...props} ref={ref}/>
      <p><Button label="Open menu" onPress={openMenu}/></p>
      <p><Button label="Select Blueberry" onPress={updateSelected}/></p>
    </>
  );
};
export const MenuProviderWithRef: Story = {
  render: args => <MenuProviderWithRefC {...args}/>,
};

const CustomImage = ({ id }: React.ComponentProps<typeof Icon>) => (
  <img
    alt=""
    src={`https://picsum.photos/id/${id}/200/300`}
    // Consumer should be responsible of providing a sensible styling
    style={{ objectFit: 'cover', inlineSize: '1.3em', blockSize: '1.3em' }}
  />
);
export const MenuWithCustomIcons: Story = {
  args: {
    items: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName], index) =>
          <MenuProvider.Option
            key={fruitKey}
            itemKey={fruitKey}
            label={fruitName}
            // TODO: `icon` should not be needed when a custom `Icon` is used.
            // Revisit this custom icon condition once this PR is merged:
            // https://github.com/fortanix/baklava/pull/686
            Icon={CustomImage}
            iconProps={{ id: String(index) }}
            icon="account"
          />
        )}
      </>
    ),
  }
};
