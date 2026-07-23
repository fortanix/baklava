/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fruits, generateUsers } from '../../../../util/storybook/StorybookUtils.tsx';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { InputSearch } from '../Input/InputSearch.tsx';

import { type ItemKey, ListBox } from './ListBox.tsx';


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

export const ListBoxWithoutSelection: Story = {
  args: {
    defaultSelected: undefined,
  },
};

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

export const ListBoxLoading: Story = {
  args: {
    status: 'loading',
    children: (
      <>
        {fruits.slice(0, 5).map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxLoadingEmpty: Story = {
  args: {
    status: 'loading',
    children: null,
  },
};

/** In the accessibility tree, the accessible name should be "My list box". */
export const ListBoxWithLabel: Story = {
  args: {
    'aria-label': undefined,
    'aria-labelledby': 'story-label',
  },
  decorators: [
    Story => (
      <div>
        <span id="story-label">My list box:</span>
        <Story/>
      </div>
    ),
  ],
};

export const ListBoxShrink: Story = { args: { size: 'shrink' } };
export const ListBoxSmall: Story = { args: { size: 'small' } };
export const ListBoxMedium: Story = { args: { size: 'medium' } };
export const ListBoxLarge: Story = { args: { size: 'large' } };

export const ListBoxWithGroups: Story = {
  args: {
    defaultSelected: 'fruits-1-Blueberry',
    children: (
      <>
        <ListBox.Group label="Fruits 1">
          {fruits.slice(0, 5).map(fruit =>
            <ListBox.Option key={fruit} itemKey={`fruits-1-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
        <ListBox.Group label="Fruits 2">
          {fruits.slice(5, 10).map(fruit =>
            <ListBox.Option key={fruit} itemKey={`fruits-2-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
        <ListBox.Group label="Fruits 3">
          {fruits.slice(10).map(fruit =>
            <ListBox.Option key={fruit} itemKey={`fruits-3-${fruit}`} label={fruit}/>
          )}
        </ListBox.Group>
      </>
    ),
  },
};

/**
 * Note: static content should be presentational only. In HTML/ARIA, a listbox cannot contain interactive elements
 * other than options.
 */
export const ListBoxWithStatic: Story = {
  args: {
    defaultSelected: 'Blueberry',
    children: (
      <>
        <ListBox.Static>Some static content</ListBox.Static>
        <ListBox.Static><Icon icon="bell"/> More static content</ListBox.Static>
        <ListBox.Option itemKey="example-option">An option</ListBox.Option>
        <ListBox.Group label="Fruits">
          {fruits.slice(0, 5).map(fruit =>
            <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
          )}
        </ListBox.Group>
      </>
    ),
  },
};

export const ListBoxEmptyWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <ListBox.Segment sticky="start">
          <ListBox.Static muted>A list box with header/footer</ListBox.Static>
        </ListBox.Segment>
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
        <ListBox.Footer>
          <ListBox.Static>Footer 1</ListBox.Static>
          <ListBox.Static>Footer 2</ListBox.Static>
        </ListBox.Footer>
      </>
    ),
  },
};

export const ListBoxWithHeaderAndFooterEmpty: Story = {
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

const iconHl: Partial<React.ComponentProps<typeof Icon>> = { decoration: { type: 'background-circle' } };
export const ListBoxWithIcon: Story = {
  args: {
    defaultSelected: 'option-1',
    children: (
      <>
        <ListBox.Option icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBox.Option icon="user" itemKey="option-2" label="Another option"/>
        <ListBox.Option icon="bell" itemKey="option-3" iconProps={iconHl} label="Option with highlighted icon"/>
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

const handleDisabledPress = () => {
  notify.error(`This should not have been triggered! Check the disabled logic.`);
};
export const ListBoxDisabled: Story = {
  args: {
    disabled: true,
    defaultSelected: 'option-group-1',
    children: (
      <>
        <ListBox.Option itemKey="option-1" label="All options should be disabled" onPress={handleDisabledPress}/>
        <ListBox.Option itemKey="option-2" label="Selecting me should do nothing" onPress={handleDisabledPress}/>
        <ListBox.Group disabled={false} label="Force-enabled group">
          <ListBox.Option itemKey="option-group-1" label="I am enabled since the group overrides enabled"/>
        </ListBox.Group>
      </>
    ),
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
            {/* Note: this is technically not legal, accessibility-wise. Just for testing purposes. */}
            <InputSearch placeholder="Input keys should be ignored" automaticResize/>
          </ListBox.Static>,
          <ListBox.Static key="listbox-test">
            {/* Note: this is technically not legal, accessibility-wise. Just for testing purposes. */}
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

type ListBoxControlledProps = Omit<React.ComponentProps<typeof ListBox>, 'selected'>;
const ListBoxControlledC = (props: ListBoxControlledProps) => {
  const [selectedFruit, setSelectedFruit] = React.useState<null | ItemKey>(props.defaultSelected ?? null);
  
  return (
    <>
      <p>Selected fruit: {selectedFruit ?? <em>none</em>}</p>
      <ListBox {...props} selected={selectedFruit} onSelectedChange={setSelectedFruit}/>
      <Button label="Update state" onPress={() => { setSelectedFruit('Strawberry'); }}/>
    </>
  );
};
export const ListBoxControlled: Story = {
  render: ({ label, children }) => <ListBoxControlledC label={label}>{children}</ListBoxControlledC>,
};
export const ListBoxControlledWithDefault: Story = {
  render: ({ label, children }) => (
    <ListBoxControlledC label={label} defaultSelected="Blueberry">
      {children}
    </ListBoxControlledC>
  ),
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
};

const ListBoxWithManyOptionsC = (args: ListBoxArgs) => {
  const [count, setCount] = React.useState(100);
  
  // Recommended: memoize `children`, so that React does not rerender children elements on state change, in the case
  // that the consumer uses controlled state. If the consumer changes state and it rerenders, then the entire subtree
  // will rerender including the huge list of items. Prevent this by memoizing `children`. State updates on the items
  // that need it will still happen thanks to the internal zustand store.
  const children = React.useMemo(() => (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map(index =>
        <ListBox.Option key={`option-${index}`} itemKey={`option-${index}`}>
          {generateUsers({ numItems: 1, seed: String(index) })[0]?.name ?? ''}
        </ListBox.Option>
      )}
    </>
  ), [count]);
  
  return (
    <>
      <div style={{ display: 'flex', gap: 5, margin: 5 }}>
        <Button kind="primary" onPress={() => { setCount(100); }}>100 items</Button>
        <Button kind="primary" onPress={() => { setCount(1000); }}>1K items</Button>
        <Button kind="primary" onPress={() => { setCount(10_000); }}>10K items</Button>
      </div>
      <ListBox {...args}>{children}</ListBox>
    </>
  );
};
export const ListBoxWithManyOptions: Story = {
  render: args => <ListBoxWithManyOptionsC {...args}/>,
};
