/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { CheckboxTernary } from './CheckboxTernary.tsx';


type CheckboxTernaryArgs = React.ComponentProps<typeof CheckboxTernary>;
type Story = StoryObj<CheckboxTernaryArgs>;

export default {
  component: CheckboxTernary,
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
  render: (args) => <CheckboxTernary {...args}/>,
} satisfies Meta<CheckboxTernaryArgs>;


export const CheckboxTernaryStandard: Story = {
  name: 'CheckboxTernary',
  args: {
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTernaryDisabled: Story = {
  name: 'CheckboxTernary [disabled]',
  args: {
    disabled: true,
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTernaryFocusedIndeterminate: Story = {
  name: 'CheckboxTernary [focused]',
  args: {
    className: 'pseudo-focus-visible',
    defaultChecked: 'indeterminate',
  },
};

export const CheckboxTernaryFocusedDisabled: Story = {
  name: 'CheckboxTernary [focused] [disabled]',
  args: {
    className: 'pseudo-focus-visible',
    disabled: true,
    defaultChecked: 'indeterminate',
  },
};

const CheckboxTernaryControlled = (args: CheckboxTernaryArgs) => {
  const shiftKeyRef = React.useRef(false);
  const [checked, setChecked] = React.useState<CheckboxTernaryArgs['checked']>(args.defaultChecked ?? false);
  
  // XXX we could maybe turn this shift-click into a feature:
  // `<CheckboxTernary allowUserAction="none | shift"/>`
  return (
    <div style={{ textAlign: 'center' }}>
      <CheckboxTernary
        {...args}
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
export const CheckboxTernaryControlledStory: Story = {
  name: 'CheckboxTernary (controlled)',
  render: (args) => <CheckboxTernaryControlled {...args} defaultChecked="indeterminate"/>,
};
