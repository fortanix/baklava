/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Checkbox } from './Checkbox.tsx';


type CheckboxArgs = React.ComponentProps<typeof Checkbox>;
type Story = StoryObj<CheckboxArgs>;

export default {
  component: Checkbox,
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
  render: (args) => <Checkbox {...args}/>,
} satisfies Meta<CheckboxArgs>;


export const CheckboxStandard: Story = {
  name: 'Checkbox',
};

export const CheckboxChecked: Story = {
  name: 'Checkbox [checked]',
  args: {
    defaultChecked: true,
  },
};

export const CheckboxDisabled: Story = {
  name: 'Checkbox [disabled]',
  args: {
    disabled: true,
  },
};

export const CheckboxDisabledChecked: Story = {
  name: 'Checkbox [disabled] [checked]',
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const CheckboxFocused: Story = {
  name: 'Checkbox [focused]',
  args: {
    className: 'pseudo-focus-visible',
  },
};

export const CheckboxFocusedChecked: Story = {
  name: 'Checkbox [focused] [checked]',
  args: {
    className: 'pseudo-focus-visible',
    defaultChecked: true,
  },
};

export const CheckboxFocusedDisabled: Story = {
  name: 'Checkbox [focused] [disabled]',
  args: {
    className: 'pseudo-focus-visible',
    disabled: true,
  },
};

export const CheckboxFocusedDisabledChecked: Story = {
  name: 'Checkbox [focused] [disabled] [checked]',
  args: {
    className: 'pseudo-focus-visible',
    disabled: true,
    defaultChecked: true,
  },
};


const CheckboxControlled = (args: CheckboxArgs) => {
  const [checked, setChecked] = React.useState<CheckboxArgs['checked']>(args.defaultChecked ?? false);
  
  return (
    <div style={{ textAlign: 'center' }}>
      <Checkbox
        {...args}
        defaultChecked={undefined} // `defaultChecked` must be `undefined` for controlled components
        checked={checked}
        onUpdate={checked => { setChecked(checked); }}
      />
      {' '}
      <p>Current state: {String(checked)}</p>
    </div>
  );
};
export const CheckboxControlledStory: Story = {
  name: 'Checkbox (controlled)',
  render: (args) => <CheckboxControlled {...args} defaultChecked/>,
};
