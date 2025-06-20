/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Stepper } from './Stepper.tsx';


type StepperArgs = React.ComponentProps<typeof Stepper>;
type Story = StoryObj<StepperArgs>;

export default {
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    stepperKey: `test-stepper`,
    label: 'Test stepper',
    children: (
      <>
        {Array.from({ length: 3 }, (_, i) => i).map(index =>
          <Stepper.Step key={`step-${index + 1}`} stepKey={`step-${index + 1}`} label={`Step ${index + 1}`}/>
        )}
      </>
    ),
  },
  render: (args) => <Stepper {...args}/>,
} satisfies Meta<StepperArgs>;


export const StepperStandard: Story = {};

export const StepperWithCustomCounts: Story = {
  args: {
    stepperKey: `test-stepper-with-custom-counts`,
    start: 5, // Start at 5 (instead of 1)
    children: (
      <>
        <Stepper.Step stepKey="step-5" label="Step 5"/>
        <Stepper.Step stepKey="step-10" count={10} label="Step 10"/> {/* Override count */}
        <Stepper.Step stepKey="step-11" label="Step 11"/> {/* Subsequent steps continue from the previous count */}
      </>
    ),
  },
};

/*
const defaultSteps: Array<Step> = [1,2,3,4].map(index => { 
  return {
    stepKey: `${index}`,
    title: `Step ${index}`,
    isOptional: index === 4,
  };
});

type StepperWithTriggerProps = React.PropsWithChildren<Partial<StepperArgs>>;
const StepperWithTrigger = (props: StepperWithTriggerProps) => {
  const { steps = defaultSteps, activeKey, ...stepperContext } = props;
  const [activeStepKey, setActiveStepKey] = React.useState<string>(activeKey || '1');
  return (
    <Stepper
      onSwitch={setActiveStepKey}
      activeKey={activeStepKey}
      steps={steps}
      {...stepperContext}
    />
  );
};

const BaseStory: Story = {
  args: {},
  render: (args) => <StepperWithTrigger {...args} />,
};

export const StepperStandard: Story = {
  ...BaseStory,
  args: { ...BaseStory.args },
};

/** A step may be disabled. In this case, it will not be clickable. * /
export const StepperWithDisabledStep: Story = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    steps: [
      { stepKey: '1', title: 'Step 1', isDisabled: false },
      { stepKey: '2', title: 'Step 2', isDisabled: false },
      { stepKey: '3', title: 'Step 3 (disabled)', isDisabled: true },
      { stepKey: '4', title: 'Step 4', isDisabled: false },
    ],
  },
};

export const StepperHorizontal: Story = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    direction: 'horizontal',
  },
};
*/
