/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { loremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';
import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type ItemKey, type ItemDetails, type ListBoxMultiRef, ListBoxMulti } from './ListBoxMulti.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';


const notifyPressed = () => { notify.info('Pressed the item'); };

type ListBoxMultiArgs = React.ComponentProps<typeof ListBoxMulti>;
type Story = StoryObj<ListBoxMultiArgs>;

// Sample items
const fruits = [
  'Apple',
  'Apricot',
  'Blueberry',
  'Cherry',
  'Durian',
  'Jackfruit',
  'Melon',
  'Mango',
  'Mangosteen',
  'Orange',
  'Peach',
  'Pineapple',
  'Razzberry',
  'Strawberry',
];

export default {
  component: ListBoxMulti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test list box',
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
  render: (args) => <ListBoxMulti {...args}/>,
} satisfies Meta<ListBoxMultiArgs>;


export const ListBoxMultiStandard: Story = {
  args: {
    defaultSelected: new Set('Blueberry'),
  },
};

export const ListBoxMultiEmpty: Story = {
  args: {
    children: null,
  },
};

export const ListBoxMultiWithOverflow: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option itemKey="overflow" label={loremIpsum()}/>
        {fruits.map((fruit) =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiEmptyWithCustomPlaceholder: Story = {
  args: {
    placeholderEmpty: <><Icon icon="warning-filled"/> This is a custom placeholder</>,
    children: null,
  },
};

export const ListBoxMultiEmptyWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Header itemKey="header" label="An empty list with header/footer" sticky="start"/>
        <ListBoxMulti.FooterActions>
          <ListBoxMulti.FooterAction itemKey="action-1" label="Action 1" onActivate={() => { notifyPressed(); }}/>
          <ListBoxMulti.FooterAction itemKey="action-2" label="Action 2" onActivate={() => { notifyPressed(); }}/>
        </ListBoxMulti.FooterActions>
      </>
    ),
  },
};

export const ListBoxMultiWithIcon: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBoxMulti.Option icon="user" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

export const ListBoxMultiWithHighlightedIcon: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option icon="account" iconDecoration="highlight" itemKey="option-1" label="Option with an icon"/>
        <ListBoxMulti.Option icon="user" iconDecoration="highlight" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

const CustomIcon = (props: React.ComponentProps<typeof Icon>) =>
  <Icon
    {...props}
    style={{ color: 'light-dark(brown, orange)', ...props.style }}
  />;
export const ListBoxMultiWithCustomIcon: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option Icon={CustomIcon} icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBoxMulti.Option Icon={CustomIcon} icon="user" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

export const ListBoxMultiWithCustomItem: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Header unstyled itemKey="item-1" label="Custom Header">
          <InputSearch/>
        </ListBoxMulti.Header>
        <ListBoxMulti.Action unstyled itemKey="item-2" label="Custom option" onActivate={() => {}}>
          Custom option
        </ListBoxMulti.Action>
        <ListBoxMulti.Action unstyled itemKey="item-3" label="Another custom option" onActivate={() => {}}>
          Another custom option
        </ListBoxMulti.Action>
      </>
    ),
  },
};

/** Disabled items should still be focusable. */
export const ListBoxMultiWithDisabledOption: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option itemKey="option-1" label="This option is enabled"/>
        <ListBoxMulti.Option itemKey="option-2" label="This option is disabled, but you can still focus me" disabled/>
        <ListBoxMulti.Option itemKey="option-3" label="This option is enabled"/>
      </>
    ),
  },
};

const handleDisabledActivate = () => {
  notify.error(`This should not have been triggered! Check the disabled logic.`);
};
export const ListBoxMultiDisabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <ListBoxMulti.Option itemKey="item-1" label="All options should be disabled"/>
        <ListBoxMulti.Option itemKey="item-2" label="Selecting me should do nothing"/>
        <ListBoxMulti.Action itemKey="item-3" label="Activating me should do nothing" onActivate={handleDisabledActivate}/>
      </>
    ),
  },
};

export const ListBoxMultiWithHeaders: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky={false}/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBoxMulti.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky={false}/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiWithStickyHeaders: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBoxMulti.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiWithActions: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option itemKey="option-1" label="Option 1"/>
        <ListBoxMulti.Option itemKey="option-2" label="Option 2"/>
        <ListBoxMulti.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => { notifyPressed(); }}/>
        <ListBoxMulti.Action itemKey="action-2" icon="delete" label="Action 2" onActivate={() => { notifyPressed(); }}/>
      </>
    ),
  },
};

export const ListBoxMultiWithStickyActions: Story = {
  args: {
    style: { '--sticky-items-end': 2 },
    children: (
      <>
        <ListBoxMulti.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBoxMulti.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
        <ListBoxMulti.FooterActions>
          <ListBoxMulti.Action itemKey="action-checkout" label="Go to Checkout" onActivate={() => { notifyPressed(); }}/>
          <ListBoxMulti.Action itemKey="action-oneclick" label="One-Click Purchase" onActivate={() => { notifyPressed(); }}/>
        </ListBoxMulti.FooterActions>
      </>
    ),
  },
};

export const ListBoxMultiLoading: Story = {
  args: {
    children: (
      <>
        {fruits.slice(0, 2).map((fruit) =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
    isLoading: true,
  },
};

/**
 * When the list box is selected, typing a string of characters will automatically select the first option found that
 * starts with the typed string. This should in a case insensitive way, ignoring most diacritics.
 */
export const ListBoxMultiTypeAhead: Story = {
  args: {
    children: (
      <>
        {[
          ' whitespace', // Whitespace at start/end should be ignored (matches: "w")
          'A capitalized sentence', // Case insensitivity (matches: "a", or also "A", or also "a<space>")
          'apple', // Type letters in rapid sequence in case of ambiguity (matches: "ap")
          '42', // Numbers should work (matches: "4")
          '#hashtag', // Special characters should work (matches: "#")
          'ça', // Diacritics should be ignored (matches: "c")
          'ôté', // (matches: "o")
          'ñoñada', // (matches: "n")
          'Über', // Case insensitivity + diacritics (matches: "u", or also "U")
          'ß', // Language-specific collation rules (e.g. "Straße" = "Strasse") (NOTE: currently does not work)
          '€20', // Composition using Alt (matches "Alt+Shift+2" on certain European keyboards)
          'ไทย', // Non-ASCII characters should work (matches: "ไ" on a Thai keyboard)
          'かな', // For keyboards using live conversion like Japanese romaji or Chinese pinyin, matching will still be
                 // Latin-based. However, this would match "か" on a kana-based Japanese keyboard layout.
        ].map((char) =>
          <ListBoxMulti.Option key={char} itemKey={char} label={char}/>
        )}
      </>
    ),
  },
};

type ListBoxMultiManyProps = Omit<React.ComponentProps<typeof ListBoxMulti>, 'selected'>;
const ListBoxMultiManyC = (props: ListBoxMultiManyProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [count, setCount] = React.useState(100);
  return (
    <>
      <div style={{ display: 'flex', gap: 5, margin: 5 }}>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(100)); }}>100 items</Button>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(1000)); }}>1K items</Button>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(10_000)); }}>10K items</Button>
      </div>
      <ListBoxMulti {...props}>
        {Array.from({ length: count }).map((_, index) =>
          index === 500
            ? <ListBoxMulti.Option key="find-me" itemKey="find-me" label="Find me"/> // Searchability test (CTRL/CMD+F)
            : <ListBoxMulti.Option key={`opt-${index + 1}`} itemKey={`opt-${index + 1}`} label={`Option ${index + 1}`}/>
        )}
      </ListBoxMulti>
    </>
  );
};
export const ListBoxMultiMany: Story = {
  render: args => <ListBoxMultiManyC {...args}/>,
};

type ListBoxMultiControlledProps = Omit<React.ComponentProps<typeof ListBoxMulti>, 'selected'>;
const ListBoxMultiControlledC = (props: ListBoxMultiControlledProps) => {
  const [selectedItems, setSelectedItems] = React.useState<Map<ItemKey, ItemDetails>>(new Map());
  
  return (
    <>
      <p>Selected fruits: {[...selectedItems.values()].map(({ label }) => label).join(', ') || '(none)'}</p>
      <ListBoxMulti {...props} selected={new Set(selectedItems.keys())} onSelect={setSelectedItems}/>
    </>
  );
};
export const ListBoxMultiControlled: Story = {
  render: args => <ListBoxMultiControlledC {...args}/>,
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            const selected = new FormData(event.currentTarget).getAll('controlledListBoxMulti[]');
            notify.info(`You have chosen: ${selected.join(', ') || 'none'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'controlledListBoxMulti',
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

const ListBoxMultiWithRefC = (props: React.ComponentProps<typeof ListBoxMulti>) => {
  const ref = React.useRef<ListBoxMultiRef>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current._bkListBoxFocusLast();
    }
  }, []);
  
  return <ListBoxMulti {...props} ref={ref}/>;
};
export const ListBoxMultiWithRef: Story = {
  render: args => <ListBoxMultiWithRefC {...args}/>,
  args: {},
};
