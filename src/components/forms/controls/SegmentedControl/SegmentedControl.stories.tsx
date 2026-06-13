/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';

import { type ButtonKey, SegmentedControl } from './SegmentedControl.tsx';


type SegmentedControlArgs = React.ComponentProps<typeof SegmentedControl>;
type Story = StoryObj<SegmentedControlArgs>;

export default {
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Choose a color',
    onUpdate: selected => { console.log('update', selected); },
    defaultSelected: 'red',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
  render: (args) => <SegmentedControl {...args}/>,
} satisfies Meta<SegmentedControlArgs>;


export const SegmentedControlStandard: Story = {};

export const SegmentedControlWithIcon: Story = {
  args: {
    defaultSelected: 'edit',
    children: (
      <>
        <SegmentedControl.Button buttonKey="edit" icon="edit" label="Edit"/>
        <SegmentedControl.Button buttonKey="delete" icon="delete" label="Delete"/>
      </>
    ),
  },
};

export const SegmentedControlWithIconOnly: Story = {
  args: {
    defaultSelected: 'edit',
    children: (
      <>
        <SegmentedControl.Button buttonKey="edit" aria-label="edit" icon="edit"/>
        <SegmentedControl.Button buttonKey="delete" aria-label="delete" icon="delete"/>
      </>
    ),
  },
};

export const SegmentedControlHover: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" className="pseudo-hover"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlFocused: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red" className="pseudo-focus-visible"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const SegmentedControlDisabledOne: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" disabled/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

type SegmentedControlControlledProps = Omit<React.ComponentProps<typeof SegmentedControl>, 'selected'>;
const SegmentedControlControlledC = (props: SegmentedControlControlledProps) => {
  const [selectedButton, setSelectedButton] = React.useState<undefined | ButtonKey>(props.defaultSelected ?? undefined);
  
  return (
    <>
      <p>Selected color: {selectedButton ?? <em>none</em>}</p>
      <SegmentedControl {...props} selected={selectedButton} onUpdate={setSelectedButton}/>
      <Button label="Update state" onPress={() => { setSelectedButton('blue'); }}/>
    </>
  );
};

export const SegmentedControlControlled: Story = {
  render: args => <SegmentedControlControlledC {...args}/>,
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlControlledWithDefault: Story = {
  render: args => <SegmentedControlControlledC {...args} defaultSelected="green"/>,
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};











import * as FG from '@microsoft/focusgroup-polyfill/shadowless';
import { useEffectOnce, mergeRefs } from '../../../../util/reactUtil.ts';


type FocusGroupProps = React.ComponentProps<'div'> & {
  focusGroup: string,
};
const FocusGroup = (props: FocusGroupProps) => {
  const { focusGroup, ...propsRest } = props;
  
  const ref = React.useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    // const itemCollection = new FG.TreeWalkerItemCollection(); // Not exposed...
    // new FG.FocusGroup(ownerRef.current);
    
    FG.polyfill(ref.current);
  });
  
  return (
    // @ts-ignore
    <div {...propsRest} ref={mergeRefs(ref, props.ref)} focusgroup={focusGroup}/>
  );
};



const TestC_1 = () => {
  useEffectOnce(() => { FG.polyfillBodyAndObserve(); }, []);
  
  const [_count, setCount] = React.useState(0);
  const forceRerender = () => { console.log('rerender'); setCount(counter => counter + 1); };
  
  useEffectOnce(() => {
    window.setInterval(forceRerender, 1000);
  });
  
  return (
    <>
      <Button label="Focus dummy"/>
      Focus group:{' '}
      <div role="radiogroup" focusgroup="radiogroup nowrap" aria-label="Test">
        {/* Note: `role="radio"` will be applied automatically by the polyfill */}
        <button type="button">Bold</button>
        <button type="button" focusgroupstart="true">Italic</button>
        <button type="button">Underline</button>
      </div>
    </>
  );
};

const TestC_2 = () => {
  const [_count, setCount] = React.useState(0);
  const forceRerender = () => { console.log('rerender'); setCount(counter => counter + 1); };
  
  useEffectOnce(() => {
    //window.setInterval(forceRerender, 1000);
  });
  
  const ownerRef = React.useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    // const itemCollection = new FG.TreeWalkerItemCollection(); // Not exposed...
    // new FG.FocusGroup(ownerRef.current);
    
    FG.polyfill(ownerRef.current!);
  });
  
  return (
    <>
      <p><Button label="Focus dummy"/></p>
      
      <p>Focus group:</p>
      <div ref={ownerRef} role="radiogroup" focusgroup="radiogroup nowrap" aria-label="Test">
        <button type="button">Bold</button>
        <button type="button" focusgroupstart="true">Italic</button>
        <button type="button">Underline</button>
      </div>
    </>
  );
};

const TestC = () => {
  type Option = 'bold' | 'italic' | 'underline';
  
  const [selected, setSelected] = React.useState('italic');
  const handlePress = (option: Option) => () => {
    setSelected(option);
  };
  
  return (
    <>
      <style>{`@scope { button[aria-checked="true"] { color: red; } }`}</style>
      
      <p><Button label="Focus dummy"/></p>
      
      <p>Focus group:</p>
      <FocusGroup role="radiogroup" focusGroup="radiogroup nowrap" aria-label="Test">
        {['bold', 'italic', 'underline'].map(option =>
          <Button label={option} onPress={handlePress(option)} focusgroupstart={selected === option} aria-checked={selected === option}/>
        )}
      </FocusGroup>
    </>
  );
};

export const Test: Story = {
  render: args => <TestC/>,
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};
