/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorBright } from '../../util/storybook/StorybookUtils.tsx';
import { DummyLink } from '../../util/storybook/StorybookLink.tsx';


/*
This file tests the global styling, outside of any component context. Relevant files:

- `reset.scss`
- `global.scss`
*/

const Global = ({ children }: React.PropsWithChildren) => children; // Dummy component

type Story = StoryObj<typeof Global>;

export default {
  component: Global,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: ({ children }) => <Global>{children}</Global>,
} satisfies Meta;


/**
 * At the global level, all styling is reset to their most basic possible defaults. For example:
 * - Fonts: the standard body type font, with default weight, no decorations.
 * - Line height: minimal, such that "single line" components do not need to compensate for the additional space.
 * - Spacing: no margin or padding.
 */
export const GlobalStandard: Story = {
  args: {
    children: (
      <>
        <p>Test paragraph 1</p>
        <p>Test paragraph 2</p>
        <p><DummyLink>Test link</DummyLink></p>
        <pre>{`
Preformatted text spanning
across two lines.
        `.trim()}</pre>
      </>
    ),
  },
};

/**
 * Inheritance should still work as expected. In other words: we should never use CSS `initial` on an inherited
 * property, unless inheritance is to be explicitly stopped (use something like `unset` instead).
 */
export const GlobalInheritance: Story = {
  args: {
    children: (
      <p style={{ color: colorBright }}>
        This paragraph is colored, and that color should be inherited by
        {' '}
        <span style={{ textDecoration: 'underline' }}>this nested span</span>.
      </p>
    ),
  },
};

export const GlobalComponentIsolation: Story = {
  args: {
    children: (
      <div style={{ color: colorBright, textTransform: 'uppercase', fontWeight: 'bold' }}>
        This element has custom styling applied, which should not "leak" into the following element:
        
        <div className="bk-isolate">
          This element has <code className="bk-prose">class="bk-isolate"</code>, and therefore should be fully isolated
          from inherited properties.
        </div>
        
        <div>
          <label className="bk-isolate">
            This label should still have the
            {' '}
            <code className="bk-prose">cursor: pointer; user-select: none</code>
            {' '}
            from our reset.
            <input type="checkbox"/>
          </label>
        </div>
        
        This sentence should again be styled.
      </div>
    ),
  },
};

export const GlobalLists: Story = {
  args: {
    children: (
      <>
        <ul>
          <li>This is an unordered list, <code>{'<ul>'}</code>.</li>
          <li>It should have no bullet points or margin/padding.</li>
        </ul>
        <ol>
          <li>This is an ordered list, <code>{'<ol>'}</code>.</li>
          <li>It should have no bullet points or margin/padding.</li>
        </ol>
        <dl>
          <dt>This is:</dt>
          <dd>a definition list, <code>{'<dl>'}</code>.</dd>
          <div>
            <dt>It should:</dt>
            <dd>have no margin/padding, and the <code>{'<dt>'}</code> should have a default font + weight.</dd>
          </div>
        </dl>
        
        <ol style={{ listStyle: 'revert' }}>
          <li>When reverting <code>list-style</code>, the default marker should return.</li>
          <li>Here is a nested ordered list:</li>
          <ol style={{ listStyle: 'revert' }}>
            <li>The counter of this nested list should restart at 1.</li>
            <li>There should still be no indents on this nested list.</li>
          </ol>
        </ol>
      </>
    ),
  },
};

/** Form elements should have minimal styles, without loss of functionality. */
export const GlobalForms: Story = {
  args: {
    children: (
      <form>
        <p><input type="text" placeholder="Text"/></p>
        <p><input type="number" placeholder="Number"/></p>
        <p><textarea rows={2} placeholder="Text area"></textarea></p>
        <p><label>Checkbox: <input type="checkbox"/></label></p>
        <p><label>Radio: <input type="radio"/></label></p>
        <p>
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </p>
        <p contentEditable="true">Content editable</p>
        <p contentEditable="plaintext-only">Content editable (plain text only)</p>
        <button type="button">Button</button>
        
        <p><meter min={0} max={100} value={50} style={{ width: '100%', height: '1lh' }}>50/100</meter></p>
        
        <div className="meters">
          <style>{`@scope { label { display: grid; grid-template-columns: 18ch 200px; margin-block: 0.4lh; } }`}</style>
          <label>
            Optimum
            <meter min="0" max="100" low={33} high={66} optimum={80} value={85}>85/100</meter>
          </label>
          
          <label>
            Sub-optimum
            <meter min="0" max="100" low={33} high={66} optimum={80} value={50}>50/100</meter>
          </label>
          
          <label>
            Sub-sub-optimum
            <meter min="0" max="100" low={33} high={66} optimum={80} value={20}>20/100</meter>
          </label>
        </div>
        
        <p><progress max={100} value={70} style={{ width: '100%', height: '1lh' }}>70%</progress></p>
      </form>
    ),
  },
};

export const GlobalDetails: Story = {
  args: {
    children: (
      <details>
        <summary>Details element (click to open)</summary>
        <p>Details element contents</p>
      </details>
    ),
  },
};

export const GlobalTables: Story = {
  args: {
    children: (
      <table className="bk-isolate">
        <style>{`@scope { :is(th, td) { border: 1px solid currentColor; } }`}</style>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Cell 1</th>
            <th>Cell 2</th>
          </tr>
          <tr>
            <th>Cell 1</th>
            <th>Cell 2</th>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <th>Footer 1</th>
            <th>Footer 2</th>
          </tr>
        </tbody>
        <caption>Test table</caption>
      </table>
    ),
  },
};

export const GlobalPopovers: Story = {
  args: {
    children: (
      <div>
        <style>{`@scope {
          p { margin-block: 1em; }
          
          [popover] { padding: 1em; background: contrast-color(currentColor); border: 3px solid currentColor; }
        }`}</style>
        <div id="story-popover-1" popover="auto">This is a popover</div>
        <button type="button" commandFor="story-popover-1" command="toggle-popover">Toggle popover</button>
      </div>
    ),
  },
};

export const GlobalModals: Story = {
  args: {
    children: (
      <div>
        <style>{`@scope {
          section { margin-block: 1em; }
          
          dialog { padding: 1em; background: contrast-color(currentColor); border: 3px solid currentColor; }
        }`}</style>
        
        <dialog id="story-dialog-1" closedBy="any">This is a modal dialog</dialog>
        
        <section>
          <button type="button" commandFor="story-dialog-1" command="show-modal">Show modal</button>
        </section>
        <section style={{ webkitUserSelect: 'none', userSelect: 'none' }}>
          <dialog id="story-dialog-2" closedBy="any">This text should be selectable</dialog>
          Text is not selectable here, but should still be selectable in the following dialog:
          <br/>
          <button type="button" commandFor="story-dialog-2" command="show-modal">Show modal</button>
        </section>
        
        <section style={{ cursor: 'not-allowed', pointerEvents: 'none' }}>
          <dialog id="story-dialog-3" closedBy="any">
            This dialog should have the default cursor, and should allow pointer events on the following:
            {' '}
            <button type="button" commandFor="story-dialog-3" command="request-close">Click me to close</button>
          </dialog>
          
          Use the keyboard to open the following and test that it did not inherit the properties from this paragraph:
          <br/>
          <button type="button" commandFor="story-dialog-3" command="show-modal">Show modal</button>
        </section>
      </div>
    ),
  },
};

export const GlobalDraggable = () => {
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        console.log('Drag start', event);
      }}
      style={{
        padding: 20,
        border: '1px solid red',
      }}
    >
      Drag Me
    </button>
  );
};
