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

import { type ItemKey, type ListBoxMultiRef, ListBoxMulti } from './ListBoxMulti.tsx';


type ListBoxMultiArgs = React.ComponentProps<typeof ListBoxMulti>;
type Story = StoryObj<ListBoxMultiArgs>;

export default {
  component: ListBoxMulti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test list box multi',
    children: (
      <>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
  render: (args) => <ListBoxMulti {...args}/>,
} satisfies Meta<ListBoxMultiArgs>;


export const ListBoxMultiStandard: Story = {
  args: {
    defaultSelected: new Set(['Blueberry', 'Mango']),
  },
};

export const ListBoxMultiWithoutSelection: Story = {
  args: {
    defaultSelected: undefined,
  },
};

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

export const ListBoxMultiLoading: Story = {
  args: {
    status: 'loading',
    children: (
      <>
        {fruits.slice(0, 5).map(fruit =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
  },
};

export const ListBoxMultiLoadingEmpty: Story = {
  args: {
    status: 'loading',
    children: null,
  },
};

/** In the accessibility tree, the accessible name should be "My list box multi". */
export const ListBoxMultiWithLabel: Story = {
  args: {
    'aria-label': undefined,
    'aria-labelledby': 'story-label',
  },
  decorators: [
    Story => (
      <div>
        <span id="story-label">My list box multi:</span>
        <Story/>
      </div>
    ),
  ],
};

export const ListBoxMultiShrink: Story = { args: { size: 'shrink' } };
export const ListBoxMultiSmall: Story = { args: { size: 'small' } };
export const ListBoxMultiMedium: Story = { args: { size: 'medium' } };
export const ListBoxMultiLarge: Story = { args: { size: 'large' } };

export const ListBoxMultiWithGroups: Story = {
  args: {
    defaultSelected: new Set(['fruits-1-Blueberry', 'fruits-2-Mango']),
    children: (
      <>
        <ListBoxMulti.Group label="Fruits 1">
          {fruits.slice(0, 5).map(fruit =>
            <ListBoxMulti.Option key={fruit} itemKey={`fruits-1-${fruit}`} label={fruit}/>
          )}
        </ListBoxMulti.Group>
        <ListBoxMulti.Group label="Fruits 2">
          {fruits.slice(5, 10).map(fruit =>
            <ListBoxMulti.Option key={fruit} itemKey={`fruits-2-${fruit}`} label={fruit}/>
          )}
        </ListBoxMulti.Group>
        <ListBoxMulti.Group label="Fruits 3">
          {fruits.slice(10).map(fruit =>
            <ListBoxMulti.Option key={fruit} itemKey={`fruits-3-${fruit}`} label={fruit}/>
          )}
        </ListBoxMulti.Group>
      </>
    ),
  },
};

export const ListBoxMultiWithGroupsEmpty: Story = {
  args: {
    empty: false, // NOTE: the consumer must set this manually in this case
    children: (
      <>
        <ListBoxMulti.Group label="An empty group"/>
        <ListBoxMulti.Group label="Another empty group"/>
      </>
    ),
  },
};

/**
 * Note: static content should be presentational only. In HTML/ARIA, a listbox cannot contain interactive elements
 * other than options.
 */
export const ListBoxMultiWithStatic: Story = {
  args: {
    defaultSelected: new Set(['Blueberry', 'Mango']),
    children: (
      <>
        <ListBoxMulti.Static>Some static content</ListBoxMulti.Static>
        <ListBoxMulti.Static><Icon icon="bell"/> More static content</ListBoxMulti.Static>
        <ListBoxMulti.Option itemKey="example-option">An option</ListBoxMulti.Option>
        <ListBoxMulti.Group label="Fruits">
          {fruits.slice(0, 5).map(fruit =>
            <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
          )}
        </ListBoxMulti.Group>
      </>
    ),
  },
};

export const ListBoxMultiEmptyWithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Segment sticky="start">
          <ListBoxMulti.Static muted>A list box with header/footer</ListBoxMulti.Static>
        </ListBoxMulti.Segment>
        {fruits.map(fruit =>
          <ListBoxMulti.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
        <ListBoxMulti.Footer>
          <ListBoxMulti.Static>Footer 1</ListBoxMulti.Static>
          <ListBoxMulti.Static>Footer 2</ListBoxMulti.Static>
        </ListBoxMulti.Footer>
      </>
    ),
  },
};

export const ListBoxMultiWithHeaderAndFooterEmpty: Story = {
  args: {
    children: (
      <>
        <ListBoxMulti.Segment sticky="start">
          <ListBoxMulti.Static muted>An empty list with header/footer</ListBoxMulti.Static>
        </ListBoxMulti.Segment>
        <ListBoxMulti.Footer>
          <ListBoxMulti.Static>Footer 1</ListBoxMulti.Static>
          <ListBoxMulti.Static>Footer 2</ListBoxMulti.Static>
        </ListBoxMulti.Footer>
      </>
    ),
  },
};

const iconHl: Partial<React.ComponentProps<typeof Icon>> = { decoration: { type: 'background-circle' } };
export const ListBoxMultiWithIcon: Story = {
  args: {
    defaultSelected: new Set(['option-1', 'option-3']),
    children: (
      <>
        <ListBoxMulti.Option icon="account" itemKey="option-1" label="Option with an icon"/>
        <ListBoxMulti.Option icon="user" itemKey="option-2" label="Another option"/>
        <ListBoxMulti.Option icon="bell" itemKey="option-3" iconProps={iconHl} label="Option with highlighted icon"/>
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

const handleDisabledPress = () => {
  notify.error(`This should not have been triggered! Check the disabled logic.`);
};
export const ListBoxMultiDisabled: Story = {
  args: {
    disabled: true,
    defaultSelected: new Set(['option-1']),
    children: (
      <>
        <ListBoxMulti.Option itemKey="option-1" label="All options should be disabled" onPress={handleDisabledPress}/>
        <ListBoxMulti.Option itemKey="option-2" label="Selecting me should do nothing" onPress={handleDisabledPress}/>
        <ListBoxMulti.Group disabled={false} label="Force-enabled group">
          <ListBoxMulti.Option itemKey="option-group-1" label="I am enabled since the group overrides enabled"/>
        </ListBoxMulti.Group>
      </>
    ),
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
          <ListBoxMulti.Static key="input-test">
            {/* Note: this is technically not legal, accessibility-wise. Just for testing purposes. */}
            <InputSearch placeholder="Input keys should be ignored" automaticResize/>
          </ListBoxMulti.Static>,
          <ListBoxMulti.Static key="listbox-test">
            {/* Note: this is technically not legal, accessibility-wise. Just for testing purposes. */}
            <ListBoxMulti label="Nested ListBoxMulti">
              <ListBoxMulti.Option itemKey="nested-1" label="Key events on nested listbox should be ignored"/>
              <ListBoxMulti.Option itemKey="nested-2" label="Another nested option"/>
            </ListBoxMulti>
          </ListBoxMulti.Static>,
          'ñoñada', // (matches: "n")
          'Über', // Case insensitivity + diacritics (matches: "u", or also "U")
          'ß', // Language-specific collation rules (e.g. "Straße" = "Strasse") (NOTE: currently does not work)
          '€20', // Composition using Alt (matches "Alt+Shift+2" on certain European keyboards)
          'ไทย', // Non-ASCII characters should work (matches: "ไ" on a Thai keyboard)
          'かな', // For keyboards using live conversion like Japanese romaji or Chinese pinyin, matching will still be
                 // Latin-based. However, this would match "か" on a kana-based Japanese keyboard layout.
        ].map(stringOrElement =>
          typeof stringOrElement === 'string'
            ? <ListBoxMulti.Option key={stringOrElement} itemKey={stringOrElement} label={stringOrElement}/>
            : stringOrElement
        )}
      </>
    ),
  },
};

type ListBoxMultiControlledProps = Omit<React.ComponentProps<typeof ListBoxMulti>, 'selected'>;
const ListBoxMultiControlledC = (props: ListBoxMultiControlledProps) => {
  const [selectedItems, setSelectedItems] = React.useState<Set<ItemKey>>(props.defaultSelected ?? new Set());
  
  return (
    <>
      <p>Selected fruits: {[...selectedItems].map(key => key).join(', ') || '(none)'}</p>
      <ListBoxMulti {...props} selected={new Set(selectedItems.keys())} onSelectedChange={setSelectedItems}/>
      <Button label="Update state" onPress={() => { setSelectedItems(new Set(['Razzberry', 'Strawberry'])); }}/>
    </>
  );
};
export const ListBoxMultiControlled: Story = {
  render: ({ label, children }) => <ListBoxMultiControlledC label={label}>{children}</ListBoxMultiControlledC>,
};
export const ListBoxMultiControlledWithDefault: Story = {
  render: ({ label, children }) => (
    <ListBoxMultiControlledC label={label} defaultSelected={new Set(['Blueberry', 'Cherry', 'Orange'])}>
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


const ListBoxMultiWithManyOptionsC = (args: ListBoxMultiArgs) => {
  const [count, setCount] = React.useState(100);
  
  // Recommended: memoize `children`, so that React does not rerender children elements on state change, in the case
  // that the consumer uses controlled state. If the consumer changes state and it rerenders, then the entire subtree
  // will rerender including the huge list of items. Prevent this by memoizing `children`. State updates on the items
  // that need it will still happen thanks to the internal zustand store.
  const children = React.useMemo(() => (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map(index =>
        <ListBoxMulti.Option key={`option-${index}`} itemKey={`option-${index}`}>
          {generateUsers({ numItems: 1, seed: String(index) })[0]?.name ?? ''}
        </ListBoxMulti.Option>
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
      <ListBoxMulti {...args}>{children}</ListBoxMulti>
    </>
  );
};
export const ListBoxMultiWithManyOptions: Story = {
  render: args => <ListBoxMultiWithManyOptionsC {...args}/>,
};
