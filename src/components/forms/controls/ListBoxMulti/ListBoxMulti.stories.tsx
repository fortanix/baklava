/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { loremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';
import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, type ListBoxMultiRef, ListBoxMulti } from './ListBoxMulti.tsx';


const notifyPressed = () => { notify.info('Pressed the item'); };

type ListBoxMultiArgs = React.ComponentProps<typeof ListBoxMulti>;
type Story = StoryObj<ListBoxMultiArgs>;

// Sample options
const fruits = {
  apple: 'Apple',
  apricot: 'Apricot',
  blueberry: 'Blueberry',
  cherry: 'Cherry',
  durian: 'Durian',
  jackfruit: 'Jackfruit',
  melon: 'Melon',
  mango: 'Mango',
  mangosteen: 'Mangosteen',
  orange: 'Orange',
  peach: 'Peach',
  pineapple: 'Pineapple',
  razzberry: 'Razzberry',
  strawberry: 'Strawberry',
};
type FruitKey = keyof typeof fruits;
const formatFruitLabel = (itemKey: FruitKey): string => fruits[itemKey];

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
    defaultSelected: new Set(['blueberry', 'cherry', 'melon']),
    children: (
      <>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
  render: (args) => <ListBoxMulti {...args}/>,
} satisfies Meta<ListBoxMultiArgs>;


export const ListBoxMultiStandard: Story = {};

export const ListBoxMultiShrink: Story = { args: { size: 'shrink' } };
export const ListBoxMultiSmall: Story = { args: { size: 'small' } };
export const ListBoxMultiMedium: Story = { args: { size: 'medium' } };
export const ListBoxMultiLarge: Story = { args: { size: 'large' } };

export const ListBoxMultiEmpty: Story = {
  args: {
    children: null,
  },
};

export const ListBoxMultiEmptyWithCustomPlaceholder: Story = {
  args: {
    placeholderEmpty: <><Icon icon="warning-filled"/> This is a custom placeholder</>,
    children: null,
  },
};

export const ListBoxMultiWithOverflow: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Option itemKey="overflow" label={loremIpsum()}/>
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiEmptyWithHeaderAndFooter: Story = {
  args: {
    defaultSelected: new Set(),
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
    defaultSelected: new Set(['option-2']),
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
    defaultSelected: new Set(['option-2']),
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
    defaultSelected: new Set(['option-2']),
    children: (
      <>
        <ListBoxMulti.Option Icon={CustomIcon} icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBoxMulti.Option Icon={CustomIcon} icon="user" itemKey="option-2" label="Another option"/>
      </>
    ),
  },
};

export const ListBoxWithCustomItems: Story = {
  args: {
    defaultSelected: new Set([]),
    children: (
      <>
        <ListBoxMulti.Static sticky="start">
          <InputSearch style={{ flexGrow: 1 }} placeholder="Sticky static item"/>
        </ListBoxMulti.Static>
        {Array.from({ length: 20 }, (_, i) => i).map(index => // A lot of items to test scroll for sticky item
          <ListBoxMulti.Static key={index}>
            Static item
          </ListBoxMulti.Static>
        )}
      </>
    ),
  },
};

/** Disabled items should still be focusable. */
export const ListBoxMultiWithDisabledOption: Story = {
  args: {
    defaultSelected: new Set(['option-3']),
    children: (
      <>
        <ListBoxMulti.Option itemKey="option-1" label="This option is enabled"/>
        <ListBoxMulti.Option itemKey="option-2" label="This option is disabled, but you can still focus me" disabled/>
        <ListBoxMulti.Option itemKey="option-3" label="This option is disabled and selected" disabled/>
        <ListBoxMulti.Option itemKey="option-4" label="This option is enabled"/>
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
    defaultSelected: new Set(['item-1']),
    children: (
      <>
        <ListBoxMulti.Option itemKey="item-1" label="All options should be disabled"/>
        <ListBoxMulti.Option itemKey="item-2" label="Selecting me should do nothing"/>
        <ListBoxMulti.Action itemKey="item-3" label="Activating me should do nothing"
          onActivate={handleDisabledActivate}
        />
      </>
    ),
  },
};

export const ListBoxMultiWithHeaders: Story = {
  args: {
    defaultSelected: new Set(['icecream-blueberry', 'icecream-mango', 'icecream-strawberry', 'jellybean-apple']),
    children: (
      <>
        <ListBoxMulti.Header itemKey="header-1" sticky={false}
          label={`Ice cream flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`icecream-${fruitKey}`} itemKey={`icecream-${fruitKey}`} label={fruitName}/>
        )}
        <ListBoxMulti.Header itemKey="header-2" sticky={false}
          label={`Jelly bean flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`jellybean-${fruitKey}`} itemKey={`jellybean-${fruitKey}`} label={fruitName}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiWithStickyHeaders: Story = {
  args: {
    defaultSelected: new Set(['icecream-blueberry', 'icecream-mango', 'icecream-strawberry', 'jellybean-apple']),
    children: (
      <>
        <ListBoxMulti.Header itemKey="header-1" sticky="start"
          label={`Ice cream flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`icecream-${fruitKey}`} itemKey={`icecream-${fruitKey}`} label={fruitName}/>
        )}
        <ListBoxMulti.Header itemKey="header-2" sticky="start"
          label={`Jelly bean flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`jellybean-${fruitKey}`} itemKey={`jellybean-${fruitKey}`} label={fruitName}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiWithActions: Story = {
  args: {
    defaultSelected: new Set(['option-2']),
    children: (
      <>
        <ListBoxMulti.Option itemKey="option-1" label="Option 1"/>
        <ListBoxMulti.Option itemKey="option-2" label="Option 2"/>
        <ListBoxMulti.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => { notifyPressed(); }}/>
        <ListBoxMulti.Action disabled itemKey="action-2" icon="delete" label="Action 2" onActivate={() => { notifyPressed(); }}/>
      </>
    ),
  },
};

export const ListBoxMultiWithStickyActions: Story = {
  args: {
    style: { '--sticky-items-end': 2 },
    defaultSelected: new Set(['icecream-blueberry', 'icecream-mango', 'icecream-strawberry', 'jellybean-apple']),
    children: (
      <>
        <ListBoxMulti.Header itemKey="header-1" sticky={false}
          label={`Ice cream flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`icecream-${fruitKey}`} itemKey={`icecream-${fruitKey}`} label={fruitName}/>
        )}
        <ListBoxMulti.Header itemKey="header-2" sticky={false}
          label={`Jelly bean flavors (${Object.keys(fruits).length})`}
        />
        {Object.entries(fruits).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={`jellybean-${fruitKey}`} itemKey={`jellybean-${fruitKey}`} label={fruitName}/>
        )}
        <ListBoxMulti.FooterActions>
          <ListBoxMulti.Action itemKey="action-checkout" label="Go to Checkout"
            onActivate={() => { notifyPressed(); }}
          />
          <ListBoxMulti.Action itemKey="action-oneclick" label="One-Click Purchase"
            onActivate={() => { notifyPressed(); }}
          />
        </ListBoxMulti.FooterActions>
      </>
    ),
  },
};

export const ListBoxMultiLoading: Story = {
  args: {
    defaultSelected: new Set(['apple']),
    children: (
      <>
        {Object.entries(fruits).slice(0, 2).map(([fruitKey, fruitName]) =>
          <ListBoxMulti.Option key={fruitKey} itemKey={fruitKey} label={fruitName}/>
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

type ListBoxMultiControlledProps<K extends ItemKey> = Omit<React.ComponentProps<typeof ListBoxMulti<K>>, 'selected'>;
const ListBoxMultiControlledC = (props: ListBoxMultiControlledProps<FruitKey>) => {
  const [selectedItems, setSelectedItems] = React.useState<Set<FruitKey>>(props.defaultSelected ?? new Set());
  
  return (
    <>
      <p>Selected fruits: {[...selectedItems].map(key => formatFruitLabel(key)).join(', ') || '(none)'}</p>
      <ListBoxMulti<FruitKey> {...props} selected={new Set(selectedItems.keys())} onSelect={setSelectedItems}/>
      <Button label="Update state" onPress={() => { setSelectedItems(new Set(['razzberry', 'strawberry'])); }}/>
    </>
  );
};
export const ListBoxMultiControlled: Story = {
  render: ({ label, children }) => <ListBoxMultiControlledC label={label}>{children}</ListBoxMultiControlledC>,
};
export const ListBoxMultiControlledWithDefault: Story = {
  render: ({ label, children }) => (
    <ListBoxMultiControlledC label={label} defaultSelected={new Set(['blueberry', 'cherry', 'orange'])}>
      {children}
    </ListBoxMultiControlledC>
  ),
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
