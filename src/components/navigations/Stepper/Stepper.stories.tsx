/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Stepper } from './Stepper.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';
import { TooltipProvider } from '../../overlays/Tooltip/TooltipProvider.tsx';

type StepperArgs = React.ComponentProps<typeof Stepper>;
type Story = StoryObj<StepperArgs>;

const DefaultSteps = (
  <>
    <Stepper.Step stepKey="account" label="Account" />
    <Stepper.Step stepKey="profile" label="Profile" />
    <Stepper.Step stepKey="security" label="Security" />
    <Stepper.Step stepKey="review" label="Review" />
  </>
);

export default {
  component: Stepper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    label: 'Setup wizard',
    children: DefaultSteps,
  },
} satisfies Meta<StepperArgs>;

export const StepperStandard: Story = {
  args: {
    defaultActiveStepKey: 'account',
  },
  render: (args) => <Stepper {...args} />,
};

export const StepperHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    defaultActiveStepKey: 'account',
  },
  render: (args) => <Stepper {...args} />,
};

export const StepperWithDefaultActiveStep: Story = {
  args: {
    defaultActiveStepKey: 'profile',
  },
  render: (args) => <Stepper {...args} />,
};

export const StepperControlled: Story = {

  render: (args) => {
    const [activeStep, setActiveStep] = React.useState('step-2');

    return (
      <Stepper
        {...args}
        activeStepKey={activeStep}
        onSwitch={setActiveStep}
      >
        <Stepper.Step stepKey="step-1" label="Step 1" />
        <Stepper.Step stepKey="step-2" label="Step 2" />
        <Stepper.Step stepKey="step-3" label="Step 3" />
        <Stepper.Step stepKey="step-4" label="Step 4" />
      </Stepper>
    );
  },
};

export const StepperControlledHorizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => {
    const [activeStep, setActiveStep] = React.useState('step-2');

    return (
      <Stepper
        {...args}
        activeStepKey={activeStep}
        onSwitch={setActiveStep}
      >
        <Stepper.Step stepKey="step-1" label="Step 1" />
        <Stepper.Step stepKey="step-2" label="Step 2" />
        <Stepper.Step stepKey="step-3" label="Step 3" />
        <Stepper.Step stepKey="step-4" label="Step 4" />
      </Stepper>
    );
  },
};

export const StepperWithCustomStart: Story = {
  args: {
    start: 5,
    defaultActiveStepKey: 'planning',
    children: (
      <>
        <Stepper.Step stepKey="planning" label="Planning" />
        <Stepper.Step stepKey="design" label="Design" />
        <Stepper.Step stepKey="development" label="Development" />
        <Stepper.Step stepKey="testing" label="Testing" />
      </>
    ),
  },
};

export const StepperWithCustomCounts: Story = {
  args: {
    start: 5,
    defaultActiveStepKey: 'planning',
    children: (
      <>
        <Stepper.Step
          stepKey="planning"
          label="Planning"
        />

        <Stepper.Step
          stepKey="phase-10"
          count={10}
          label="Implementation"
        />

        <Stepper.Step
          stepKey="phase-11"
          label="Validation"
        />

        <Stepper.Step
          stepKey="release"
          label="Release"
        />
      </>
    ),
  },
};

export const StepperWithCustomCountsHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    defaultActiveStepKey: 'planning',
    start: 2,
    children: (
      <>
        <Stepper.Step
          stepKey="planning"
          label="Planning"
        />

        <Stepper.Step
          stepKey="verification1"
          label="Verification 1"
        />

        <Stepper.Step
          stepKey="migration"
          count={102}
          label="Large data migration"
        />

        <Stepper.Step
          stepKey="verification2"
          label="Verification 2"
        />

        <Stepper.Step
          stepKey="verification3"
          label="Verification 3"
        />

        <Stepper.Step
          stepKey="release-candidate"
          count={10}
          label="Release candidate"
        />

        <Stepper.Step
          stepKey="production"
          label="Production rollout"
        />
      </>
    ),
  },
};

export const StepperWithDisabledStep: Story = {
  args: {
    defaultActiveStepKey: 'profile',
  },
  render: (args) => (
    <Stepper {...args}>
      <Stepper.Step stepKey="account" label="Account" />
      <Stepper.Step stepKey="profile" label="Profile" />
      <Stepper.Step
        stepKey="security"
        label="Security"
        description={
          <>
            <p>Complete security authentication before continuing.</p>

            <Button>
              Configure
            </Button>
          </>
        }
      >
        Security configuration
        <TooltipProvider tooltip="This is a security configuration step">
          <Icon icon='info' />
        </TooltipProvider>
      </Stepper.Step>

      <Stepper.Step
        stepKey="review"
        label="Review (disabled)"
        disabled
      />

      <Stepper.Step
        stepKey="finish"
        label="Finish"
      />
    </Stepper>
  ),
};

export const StepperHorizontalWithDisabledStep: Story = {
  args: {
    orientation: 'horizontal',
    defaultActiveStepKey: 'profile',
  },
  render: (args) => (
    <Stepper {...args}>
      <Stepper.Step stepKey="account" label="Account" />

      <Stepper.Step stepKey="profile" label="Profile" />

      <Stepper.Step
        stepKey="security"
        label="Security configuration"
        description={
          <>
            <p>Complete security authentication before continuing.</p>

            <Button>
              Configure
            </Button>
          </>
        }
      >
        Security configuration
        <TooltipProvider tooltip="This is a security configuration step">
          <Icon icon='info' />
        </TooltipProvider>
      </Stepper.Step>

      <Stepper.Step
        stepKey="review"
        label="Review"
      />

      <Stepper.Step
        stepKey="disabled"
        label="Review disabled"
        disabled
      />

      <Stepper.Step
        stepKey="finish"
        label="Finish"
      />
    </Stepper>
  ),
};

export const StepperVerticalWithStepBody: Story = {
  args: {
    orientation: 'vertical',
    defaultActiveStepKey: '2',
  },
  render: (args) => (
    <Stepper {...args}>
      <Stepper.Step stepKey="1" label="Create project" description="Short description." />
      <Stepper.Step
        stepKey="2"
        label="Configure environment"
        description={`This is a much longer body that should be the children to
        verify that the connector length is calculated correctly when a step
        contains additional content.`}
      />

      <Stepper.Step
        stepKey="3"
        label="Deploy to production"
        description="Another body with child of content for testing."
      />

      <Stepper.Step
        stepKey="4"
        label="Verify"
        description="Done"
      />
    </Stepper >
  ),
};

export const StepperHorizontalWithStepBody: Story = {
  args: {
    orientation: 'horizontal',
    defaultActiveStepKey: '2',
  },
  render: (args) => (
    <Stepper {...args}>
      <Stepper.Step stepKey="1" label="Create project" description="Short description." />

      <Stepper.Step
        stepKey="2"
        label="Configure environment"
        description={`This is a much longer body that should be the children to
        verify that the connector length is calculated correctly when a step
        contains additional content.`}
      />

      <Stepper.Step
        stepKey="3"
        label="Deploy to production"
        description="Another body with child of content for testing."
      />

      <Stepper.Step
        stepKey="4"
        label="Verify"
        description="Done"
      />
    </Stepper >
  ),
};

export const StepperWithCustomCountsReversed: Story = {
  args: {
    defaultActiveStepKey: 'planning',
    reversed: true,
    start: 2,
    children: (
      <>
        <Stepper.Step
          stepKey="planning"
          label="Planning"
        />

        <Stepper.Step
          stepKey="verification1"
          label="Verification 1"
        />

        <Stepper.Step
          stepKey="migration"
          count={102}
          label="Large data migration"
        />

        <Stepper.Step
          stepKey="verification2"
          label="Verification 2"
        />

        <Stepper.Step
          stepKey="verification3"
          label="Verification 3"
        />

        <Stepper.Step
          stepKey="release-candidate"
          count={10}
          label="Release candidate"
        />

        <Stepper.Step
          stepKey="production"
          label="Production rollout"
        />
      </>
    ),
  },
};
