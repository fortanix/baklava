/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { loremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';
import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type ItemKey, type ListBoxRef, ListBox } from './ListBox.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';


const notifyPressed = () => { notify.info('Pressed the item'); };

type ListBoxArgs = React.ComponentProps<typeof ListBox>;
type Story = StoryObj<ListBoxArgs>;

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
  component: ListBox,
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
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
  render: (args) => <ListBox {...args}/>,
} satisfies Meta<ListBoxArgs>;


export const ListBoxStandard: Story = {
  args: {
    defaultSelected: 'Blueberry',
  },
};

export const ListBoxEmpty: Story = {
  args: {
    children: null,
  },
};

export const ListBoxWithOverflow: Story = {
  args: {
    children: (
      <>
        <ListBox.Option itemKey="overflow" label={loremIpsum()}/>
        {fruits.map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxEmptyWithCustomPlaceholder: Story = {
  args: {
    placeholderEmpty: <><Icon icon="warning-filled"/> This is a custom placeholder</>,
    children: null,
  },
};

export const ListBoxEmptyWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <ListBox.Header itemKey="header" label="An empty list with header/footer" sticky="start"/>
        <ListBox.FooterActions>
          <ListBox.FooterAction itemKey="action-1" label="Action 1" onActivate={() => { notifyPressed(); }}/>
          <ListBox.FooterAction itemKey="action-2" label="Action 2" onActivate={() => { notifyPressed(); }}/>
        </ListBox.FooterActions>
      </>
    ),
  },
};

export const ListBoxWithIcon: Story = {
  args: {
    children: (
      <>
        <ListBox.Option icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBox.Option icon="user" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

export const ListBoxWithHighlightedIcon: Story = {
  args: {
    children: (
      <>
        <ListBox.Option icon="account" iconDecoration="highlight" itemKey="option-1" label="Option with an icon"/>
        <ListBox.Option icon="user" iconDecoration="highlight" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

const CustomIcon = (props: React.ComponentProps<typeof Icon>) =>
  <Icon
    {...props}
    style={{ color: 'light-dark(brown, orange)', ...props.style }}
  />;
export const ListBoxWithCustomIcon: Story = {
  args: {
    children: (
      <>
        <ListBox.Option Icon={CustomIcon} icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBox.Option Icon={CustomIcon} icon="user" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

export const ListBoxWithCustomItem: Story = {
  args: {
    children: (
      <>
        <ListBox.Header unstyled itemKey="item-1" label="Custom Header">
          <InputSearch/>
        </ListBox.Header>
        <ListBox.Action unstyled itemKey="item-2" label="Custom option" onActivate={() => {}}>
          Custom option
        </ListBox.Action>
        <ListBox.Action unstyled itemKey="item-3" label="Another custom option" onActivate={() => {}}>
          Another custom option
        </ListBox.Action>
      </>
    ),
  },
};

/** Disabled items should still be focusable. */
export const ListBoxWithDisabledOption: Story = {
  args: {
    children: (
      <>
        <ListBox.Option itemKey="option-1" label="This option is enabled"/>
        <ListBox.Option itemKey="option-2" label="This option is disabled, but you can still focus me" disabled/>
        <ListBox.Option itemKey="option-3" label="This option is enabled"/>
      </>
    ),
  },
};

const handleDisabledActivate = () => {
  notify.error(`This should not have been triggered! Check the disabled logic.`);
};
export const ListBoxDisabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <ListBox.Option itemKey="item-1" label="All options should be disabled"/>
        <ListBox.Option itemKey="item-2" label="Selecting me should do nothing"/>
        <ListBox.Action itemKey="item-3" label="Activating me should do nothing" onActivate={handleDisabledActivate}/>
      </>
    ),
  },
};

export const ListBoxWithHeaders: Story = {
  args: {
    children: (
      <>
        <ListBox.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky={false}/>
        {fruits.map(fruit =>
          <ListBox.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBox.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky={false}/>
        {fruits.map(fruit =>
          <ListBox.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxWithStickyHeaders: Story = {
  args: {
    children: (
      <>
        <ListBox.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBox.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBox.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBox.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxWithActions: Story = {
  args: {
    children: (
      <>
        <ListBox.Option itemKey="option-1" label="Option 1"/>
        <ListBox.Option itemKey="option-2" label="Option 2"/>
        <ListBox.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => { notifyPressed(); }}/>
        <ListBox.Action disabled itemKey="action-2" icon="delete" label="Action 2" onActivate={() => { notifyPressed(); }}/>
      </>
    ),
  },
};

export const ListBoxWithStickyActions: Story = {
  args: {
    style: { '--sticky-items-end': 2 },
    children: (
      <>
        <ListBox.Header itemKey="header" label={`Ice cream flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBox.Option key={`icecream-${fruit}`} itemKey={`icecream-${fruit}`} label={fruit}/>
        )}
        <ListBox.Header itemKey="header" label={`Jelly bean flavors (${fruits.length})`} sticky="start"/>
        {fruits.map(fruit =>
          <ListBox.Option key={`jellybean-${fruit}`} itemKey={`jellybean-${fruit}`} label={fruit}/>
        )}
        <ListBox.FooterActions>
          <ListBox.Action itemKey="action-checkout" label="Go to Checkout" onActivate={() => { notifyPressed(); }}/>
          <ListBox.Action itemKey="action-oneclick" label="One-Click Purchase" onActivate={() => { notifyPressed(); }}/>
        </ListBox.FooterActions>
      </>
    ),
  },
};

export const ListBoxLoading: Story = {
  args: {
    children: (
      <>
        {fruits.slice(0, 2).map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
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
export const ListBoxTypeAhead: Story = {
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
          <ListBox.Option key={char} itemKey={char} label={char}/>
        )}
      </>
    ),
  },
};

type ListBoxManyProps = Omit<React.ComponentProps<typeof ListBox>, 'selected'>;
const ListBoxManyC = (props: ListBoxManyProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [count, setCount] = React.useState(100);
  return (
    <>
      <div style={{ display: 'flex', gap: 5, margin: 5 }}>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(100)); }}>100 items</Button>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(1000)); }}>1K items</Button>
        <Button kind="primary" onPress={() => { startTransition(() => setCount(10_000)); }}>10K items</Button>
      </div>
      <ListBox {...props}>
        {Array.from({ length: count }).map((_, index) =>
          index === 500
            ? <ListBox.Option key="find-me" itemKey="find-me" label="Find me"/> // Searchability test (CTRL/CMD+F)
            : <ListBox.Option key={`opt-${index + 1}`} itemKey={`opt-${index + 1}`} label={`Option ${index + 1}`}/>
        )}
      </ListBox>
    </>
  );
};
export const ListBoxMany: Story = {
  render: args => <ListBoxManyC {...args}/>,
};

type ListBoxControlledProps = Omit<React.ComponentProps<typeof ListBox>, 'selected'>;
const ListBoxControlledC = (props: ListBoxControlledProps) => {
  const [selectedItem, setSelectedItem] = React.useState<null | ItemKey>(null);
  
  return (
    <>
      <p>Selected fruit: {selectedItem ?? <em>none</em>}</p>
      <ListBox {...props} selected={selectedItem} onSelect={setSelectedItem}/>
    </>
  );
};
export const ListBoxControlled: Story = {
  render: args => <ListBoxControlledC {...args}/>,
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('controlledListBox') ?? 'unknown'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'controlledListBox',
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

const ListBoxWithRefC = (props: React.ComponentProps<typeof ListBox>) => {
  const ref = React.useRef<ListBoxRef>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current._bkListBoxFocusLast();
    }
  }, []);
  
  return <ListBox {...props} ref={ref}/>;
};
export const ListBoxWithRef: Story = {
  render: args => <ListBoxWithRefC {...args}/>,
  args: {},
};
