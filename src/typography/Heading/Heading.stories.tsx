/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as Heading from './Heading.tsx';


export default {
  component: Heading.H1,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<Heading.H1Props>;


const BaseStory = {
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D473%253A73818%26t%3DjsTF1ykn6P4yp2et-1' },
  },
} as const;

export const H1: StoryObj<typeof Heading.H1> = {
  ...BaseStory,
  name: 'H1',
  args: { children: `H1 - Montserrat Light 42` },
  render: (args) => <Heading.H1 {...args}/>,
};

export const H1TextWrap: StoryObj<typeof Heading.H1> = {
  ...BaseStory,
  name: 'H1 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H1 {...args}/>,
};

export const H2: StoryObj<typeof Heading.H2> = {
  ...BaseStory,
  name: 'H2',
  args: { children: `H2 - Montserrat Regular 30` },
  render: (args) => <Heading.H2 {...args}/>,
};

export const H2TextWrap: StoryObj<typeof Heading.H2> = {
  ...BaseStory,
  name: 'H2 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H2 {...args}/>,
};

export const H3: StoryObj<typeof Heading.H3> = {
  ...BaseStory,
  name: 'H3',
  args: { children: `H3 - Montserrat Regular 24` },
  render: (args) => <Heading.H3 {...args}/>,
};

export const H3TextWrap: StoryObj<typeof Heading.H3> = {
  ...BaseStory,
  name: 'H3 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H3 {...args}/>,
};

export const H4: StoryObj<typeof Heading.H4> = {
  ...BaseStory,
  name: 'H4',
  args: { children: `H4 - Montserrat Regular 20` },
  render: (args) => <Heading.H4 {...args}/>,
};

export const H4TextWrap: StoryObj<typeof Heading.H4> = {
  ...BaseStory,
  name: 'H4 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H4 {...args}/>,
};

export const H5: StoryObj<typeof Heading.H5> = {
  ...BaseStory,
  name: 'H5',
  args: { children: `H5 - Montserrat Semi-Bold 16` },
  render: (args) => <Heading.H5 {...args}/>,
};

export const H5TextWrap: StoryObj<typeof Heading.H5> = {
  ...BaseStory,
  name: 'H5 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H5 {...args}/>,
};

export const H6: StoryObj<typeof Heading.H6> = {
  ...BaseStory,
  name: 'H6',
  args: { children: `H6 - Montserrat Medium 16` },
  render: (args) => <Heading.H6 {...args}/>,
};

export const H6TextWrap: StoryObj<typeof Heading.H6> = {
  ...BaseStory,
  name: 'H6 [text wrap]',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
  render: (args) => <Heading.H6 {...args}/>,
};

