/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { CheckboxTri } from './CheckboxTri.tsx';


type CheckboxTriArgs = React.ComponentProps<typeof CheckboxTri>;
type Story = StoryObj<CheckboxTriArgs>;

export default {
  component: CheckboxTri,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Test checkbox',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <CheckboxTri {...args}/>,
} satisfies Meta<CheckboxTriArgs>;


export const CheckboxTriStandard: Story = {
  name: 'CheckboxTri',
  args: {
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTriDisabled: Story = {
  name: 'CheckboxTri [disabled]',
  args: {
    disabled: true,
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTriFocusedIndeterminate: Story = {
  name: 'CheckboxTri [focused]',
  args: {
    className: 'pseudo-focus-visible',
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTriFocusedDisabled: Story = {
  name: 'CheckboxTri [focused] [disabled]',
  args: {
    className: 'pseudo-focus-visible',
    disabled: true,
    defaultChecked: 'indeterminate',
  },
};

const CheckboxTriControlled = (args: CheckboxTriArgs) => {
  const shiftKeyRef = React.useRef(false);
  const [checked, setChecked] = React.useState<CheckboxTriArgs['checked']>(args.defaultChecked ?? false);
  
  // XXX we could maybe turn this shift-click into a feature:
  // `<CheckboxTri allowUserAction="none | shift"/>`
  return (
    <div style={{ textAlign: 'center' }}>
      <CheckboxTri
        {...args}
        defaultChecked={undefined} // `defaultChecked` must be `undefined` for controlled components
        checked={checked}
        onMouseDown={event => { shiftKeyRef.current = event.shiftKey; }} // For click events
        onKeyDown={event => { shiftKeyRef.current = event.shiftKey; }} // For key events (spacebar)
        onChange={event => {
          setChecked(checked => {
            return (shiftKeyRef.current && checked !== 'indeterminate') ? 'indeterminate' : event.target.checked;
          });
        }}
      />
      {' '}
      <p>Current state: {String(checked)}</p>
      <p>(Shift-click to set to indeterminate)</p>
    </div>
  );
};
export const CheckboxTriControlledStory: Story = {
  name: 'CheckboxTri (controlled)',
  render: (args) => <CheckboxTriControlled {...args} defaultChecked="indeterminate"/>,
};

export const CheckboxTriLabeled: Story = {
  render: (args) => <CheckboxTri.Labeled label="Label" {...args}/>,
  args: {
    defaultChecked: 'indeterminate',
  },
};
