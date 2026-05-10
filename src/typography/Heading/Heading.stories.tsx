/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Heading from './Heading.tsx';
import { LoremIpsum } from '../../util/storybook/LoremIpsum.tsx';


export default {
  component: Heading.H1,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D473%253A73818%26t%3DjsTF1ykn6P4yp2et-1' },
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<Heading.H1Props>;


export const H1: StoryObj<typeof Heading.H1> = {
  render: (args) => <Heading.H1 {...args}/>,
  name: 'H1',
  args: { children: `H1 - Montserrat Light 42` },
};

export const H1WithTextWrap: StoryObj<typeof Heading.H1> = {
  render: (args) => <Heading.H1 {...args}/>,
  name: 'H1 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const H2: StoryObj<typeof Heading.H2> = {
  render: (args) => <Heading.H2 {...args}/>,
  name: 'H2',
  args: { children: `H2 - Montserrat Regular 30` },
};

export const H2WithTextWrap: StoryObj<typeof Heading.H2> = {
  render: (args) => <Heading.H2 {...args}/>,
  name: 'H2 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const H3: StoryObj<typeof Heading.H3> = {
  render: (args) => <Heading.H3 {...args}/>,
  name: 'H3',
  args: { children: `H3 - Montserrat Regular 24` },
};

export const H3WithTextWrap: StoryObj<typeof Heading.H3> = {
  render: (args) => <Heading.H3 {...args}/>,
  name: 'H3 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const H4: StoryObj<typeof Heading.H4> = {
  render: (args) => <Heading.H4 {...args}/>,
  name: 'H4',
  args: { children: `H4 - Montserrat Regular 20` },
};

export const H4WithTextWrap: StoryObj<typeof Heading.H4> = {
  render: (args) => <Heading.H4 {...args}/>,
  name: 'H4 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const H5: StoryObj<typeof Heading.H5> = {
  render: (args) => <Heading.H5 {...args}/>,
  name: 'H5',
  args: { children: `H5 - Montserrat Semi-Bold 16` },
};

export const H5WithTextWrap: StoryObj<typeof Heading.H5> = {
  render: (args) => <Heading.H5 {...args}/>,
  name: 'H5 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const H6: StoryObj<typeof Heading.H6> = {
  render: (args) => <Heading.H6 {...args}/>,
  name: 'H6',
  args: { children: `H6 - Montserrat Medium 16` },
};

export const H6WithTextWrap: StoryObj<typeof Heading.H6> = {
  render: (args) => <Heading.H6 {...args}/>,
  name: 'H6 with text wrap',
  args: { children: `Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines. Some really long text to demonstrate text wrapping over multiple lines.` },
};

export const HeadingWithTextAlignment: StoryObj<typeof Heading.H3> = {
  render: (args) => <Heading.H3 {...args}/>,
  name: 'Heading with text alignment',
  decorators: [
    Story => (
      <div style={{ inlineSize: '100ch', textAlign: 'right' }}>
        <LoremIpsum/>
        <Story/>
        <LoremIpsum/>
      </div>
    ),
  ],
  args: {
    children: 'This heading should be right-aligned',
  },
};
