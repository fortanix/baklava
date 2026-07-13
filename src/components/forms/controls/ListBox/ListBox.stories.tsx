/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorBright, fruits } from '../../../../util/storybook/StorybookUtils.tsx';
import { loremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, ListBox } from './ListBox.tsx';


const notifyPressed = () => { notify.info('Pressed the item'); };

type ListBoxArgs = React.ComponentProps<typeof ListBox>;
type Story = StoryObj<ListBoxArgs>;

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
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
  render: args => <ListBox {...args}/>,
} satisfies Meta<ListBoxArgs>;


export const ListBoxStandard: Story = {
  args: {
    defaultSelected: 'Blueberry',
  },
};

export const ListBoxWithGroups: Story = {
  args: {
    defaultSelected: 'Blueberry',
    children: (
      <>
        <ListBox.Group label="Fruits 1">
          {fruits.slice(0, 5).map((fruit) =>
            <ListBox.Option key={fruit} itemKey={`fruits-1-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
        <ListBox.Group label="Fruits 2">
          {fruits.slice(5, 10).map((fruit) =>
            <ListBox.Option key={fruit} itemKey={`fruits-2-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
      </>
    ),
  },
};

export const ListBoxWithStatic: Story = {
  args: {
    defaultSelected: 'Blueberry',
    children: (
      <>
        <ListBox.Static>Some static content</ListBox.Static>
        <ListBox.Group label="Fruits 1">
          {fruits.slice(0, 5).map((fruit) =>
            <ListBox.Option key={fruit} itemKey={`fruits-1-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
        <ListBox.Group label="Fruits 2">
          {fruits.slice(5, 10).map((fruit) =>
            <ListBox.Option key={fruit} itemKey={`fruits-2-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
      </>
    ),
  },
};











// OLD

export const ListBoxWithLabel: Story = {
  args: {
    defaultSelected: 'Blueberry',
    'aria-label': undefined,
    'aria-describedby': 'my-label',
  },
  decorators: [
    Story => (
      <div>
        <span id="my-label">My list box:</span>
        <Story/>
      </div>
    ),
  ],
};

export const ListBoxShrink: Story = { args: { size: 'shrink' } };
export const ListBoxSmall: Story = { args: { size: 'small' } };
export const ListBoxMedium: Story = { args: { size: 'medium' } };
export const ListBoxLarge: Story = { args: { size: 'large' } };

export const ListBoxEmpty: Story = {
  args: {
    children: null,
  },
};

export const ListBoxEmptyWithCustomPlaceholder: Story = {
  args: {
    placeholderEmpty: <><Icon icon="warning-filled"/> This is a custom placeholder</>,
    children: null,
  },
};

export const ListBoxWithOverflow: Story = {
  args: {
    children: (
      <>
        <ListBox.Option itemKey="overflow" label={loremIpsum()}/>
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxEmptyWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <ListBox.Segment sticky="start">
          <ListBox.Static muted>An empty list with header/footer</ListBox.Static>
        </ListBox.Segment>
        <ListBox.Footer>
          <ListBox.Static>Footer 1</ListBox.Static>
          <ListBox.Static>Footer 2</ListBox.Static>
        </ListBox.Footer>
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
        <ListBox.Option itemKey="option-1" icon="account" iconDecoration="highlight" label="Option with an icon"/>
        <ListBox.Option itemKey="option-2" icon="user" iconDecoration="highlight" label="Another option"/>
        <ListBox.Option itemKey="option-3" icon="user" label="Without highlight (should line up)"/>
      </>
    ),
  },
};

const CustomIcon = (props: React.ComponentProps<typeof Icon>) =>
  <Icon
    {...props}
    style={{ color: colorBright, ...props.style }}
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

export const ListBoxWithCustomItems: Story = {
  args: {
    placeholderEmpty: null,
    children: (
      <>
        <ListBox.Segment sticky="start">
          <ListBox.Static>
            <InputSearch style={{ flexGrow: 1 }} placeholder="Sticky static item"/>
          </ListBox.Static>
        </ListBox.Segment>
        {Array.from({ length: 20 }, (_, i) => i).map(index => // A lot of items to test scroll for sticky item
          <ListBox.Static key={index}>Static item</ListBox.Static>
        )}
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

export const ListBoxDisabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <ListBox.Option itemKey="item-1" label="All options should be disabled"/>
        <ListBox.Option itemKey="item-2" label="Selecting me should do nothing"/>
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
    size: 'shrink',
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
          <ListBox.Static key="input-test">
            <InputSearch placeholder="Input keys should be ignored" automaticResize/>
          </ListBox.Static>,
          <ListBox.Static key="listbox-test">
            <ListBox label="Nested ListBox">
              <ListBox.Option itemKey="nested-1" label="Key events on nested listbox should be ignored"/>
              <ListBox.Option itemKey="nested-2" label="Another nested option"/>
            </ListBox>
          </ListBox.Static>,
          'ñoñada', // (matches: "n")
          'Über', // Case insensitivity + diacritics (matches: "u", or also "U")
          'ß', // Language-specific collation rules (e.g. "Straße" = "Strasse") (NOTE: currently does not work)
          '€20', // Composition using Alt (matches "Alt+Shift+2" on certain European keyboards)
          'ไทย', // Non-ASCII characters should work (matches: "ไ" on a Thai keyboard)
          'かな', // For keyboards using live conversion like Japanese romaji or Chinese pinyin, matching will still be
                 // Latin-based. However, this would match "か" on a kana-based Japanese keyboard layout.
        ].map(stringOrElement =>
          typeof stringOrElement === 'string'
            ? <ListBox.Option key={stringOrElement} itemKey={stringOrElement} label={stringOrElement}/>
            : stringOrElement
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
  const [selectedItem, setSelectedItem] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  
  return (
    <>
      <p>Selected fruit: {selectedItem ?? <em>none</em>}</p>
      <ListBox
        {...props}
        selected={selectedItem}
        onSelect={setSelectedItem}
      >
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </ListBox>
      <Button label="Update state" onPress={() => { setSelectedItem('Strawberry'); }}/>
    </>
  );
};
export const ListBoxControlled: Story = {
  render: args => <ListBoxControlledC {...args}/>,
};
export const ListBoxControlledWithDefault: Story = {
  render: args => <ListBoxControlledC {...args} defaultSelected="Blueberry"/>,
};

export const ListBoxInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('controlledListBox') ?? '(none)'}`);
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
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

const ListBoxWithRefC = (props: React.ComponentProps<typeof ListBox>) => {
  const ref = React.useRef<React.ComponentRef<typeof ListBox>>(null);
  
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
