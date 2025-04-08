/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

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
    //onSelect: item => { console.log('x', item); },
  },
  render: (args) => <ListBox {...args}/>,
} satisfies Meta<ListBoxArgs>;


// Sample items
const fruits = ['Apple', 'Apricot', 'Blueberry', 'Cherry', 'Melon', 'Mango', 'Orange', 'Peach', 'Strawberry'];


export const ListBoxStandard: Story = {
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit}/>
        )}
      </>
    ),
    defaultSelected: 'Blueberry',
  },
};

export const ListBoxEmpty: Story = {
  args: {
    children: null,
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

export const ListBoxWithDisabled: Story = {
  args: {
    children: (
      <>
        <ListBox.Option itemKey="option-1" label="This option is enabled"/>
        <ListBox.Option itemKey="option-2" label="This option is disabled" disabled/>
        <ListBox.Option itemKey="option-3" label="Focus should skip the disabled option"/>
      </>
    ),
  },
};

export const ListBoxWithHeader: Story = {
  args: {
    children: (
      <>
        <ListBox.Header itemKey="header" label={`Fruits (${fruits.length})`}/>
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit} requireIntent/>
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
        <ListBox.Action itemKey="action-1" icon="edit" label="Action 1" onActivate={() => {}}/>
        <ListBox.Action itemKey="action-2" icon="delete" label="Action 2" onActivate={() => {}}/>
      </>
    ),
  },
};

export const ListBoxWithStickyAction: Story = {
  args: {
    children: (
      <>
        {fruits.map(fruit =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit} requireIntent/>
        )}
        <ListBox.Action itemKey="action" label="Go to checkout" onActivate={() => {}} sticky="end"/>
      </>
    ),
  },
};

export const ListBoxWithScroll: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 15 }).map((_, index) =>
          <ListBox.Option key={`option-${index + 1}`} itemKey={`option-${index + 1}`} label={`Option ${index + 1}`}/>
        )}
      </>
    ),
  },
};

/**
 * If selecting an item triggers some side effect (e.g. page change), then we only want to select an item if there
 * is an explicit user intent, such as a mouse click, tap, or pressing Enter/Space. This can be configured by setting
 * the `requireIntent` prop to `true`.
 */
export const ListBoxWithRequireIntent: Story = {
  args: {
    children: (
      <>
        {fruits.map((fruit) =>
          <ListBox.Option key={fruit} itemKey={fruit} label={fruit} requireIntent/>
        )}
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

export const ListBoxMany: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 1000 }).map((_, index) =>
          index === 500
            ? <ListBox.Option key="find-me" itemKey="find-me" label="Find me"/> // Searchability test (CTRL+F)
            : <ListBox.Option key={`opt-${index + 1}`} itemKey={`opt-${index + 1}`} label={`Option ${index + 1}`}/>
        )}
      </>
    ),
  },
};

type ListBoxControlledProps = Omit<React.ComponentProps<typeof ListBox>, 'selected'>;
const ListBoxControlledC = (props: ListBoxControlledProps) => {
  const [selectedItem, setSelectedItem] = React.useState<undefined | ItemKey>(undefined);
  
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
