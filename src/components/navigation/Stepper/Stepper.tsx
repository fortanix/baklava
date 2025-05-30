/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, type ComponentProps, classNames as cx } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import cl from './Stepper.module.scss';


/*
References:
- https://stackoverflow.com/questions/52932018/making-a-step-progress-indicator-accessible-for-screen-readers
- https://www.telerik.com/design-system/docs/components/stepper/accessibility
- https://cauldron.dequelabs.com/components/Stepper
*/

// TODO:
// - Keyboard navigation as composite control (adopt from `SegmentedControl`)
// - Overflow test (make sure the line connector isn't breaking)

export { cl as SteppersClassNames };

type Step = {
  stepKey: string,
  title: React.ReactNode,
  className?: undefined | ClassNameArgument,
  hide?: undefined | boolean,
  isOptional?: undefined | boolean,
  isDisabled?: undefined | boolean,
};
type StepperKey = Step['stepKey'];


type StepProps = ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether this step is the currently active one. Default: `false`. */
  active?: undefined | boolean,
  
  /** Whether this step should be disabled. Default: `false`. */
  disabled?: undefined | boolean,
};
export const Step = (props: StepProps) => {
  const {
    children,
    className,
    unstyled,
    active = false,
    disabled = false,
    ...propsRest
  } = props;
  
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [disabled]);
  
  return (
    <li
      aria-current={active ? 'page' : undefined}
      {...propsRest}
      className={cx(
        { [cl['bk-stepper__step']]: !unstyled },
        className,
      )}
    >
      1
    </li>
  );
};

type StepperProps = ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Step items. */
  //steps: Array<Step>,
  
  /** Active key of step. */
  //activeKey?: undefined | string,
  
  /** Whether this component should be displayed vertically or horizontally. Default: `"vertical"`. */
  orientation?: undefined | 'vertical' | 'horizontal',
  
  /** Callback executed when active step is changed. */
  onSwitch: (stepKey: StepperKey) => void,
};
/**
 * Stepper: a navigation component displaying a numbered list, representing progress through some multi-part UI flow.
 */
export const Stepper = Object.assign(
  (props: StepperProps) => {
    const {
      children,
      unstyled = false,
      //steps = [],
      //activeKey,
      orientation = 'vertical',
      onSwitch,
      ...propsRest
    } = props;
    
    return (
      <nav
        aria-label="Steps" // Should be overridden with a unique label (to distinguish from other `<nav>` landmarks)
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-stepper']]: !unstyled },
          { [cl['bk-stepper--vertical']]: orientation === 'vertical' },
          { [cl['bk-stepper--horizontal']]: orientation === 'horizontal' },
          propsRest.className,
        )}
      >
        <ol>
          {children}
          {/* {steps.map((step, index) => {
            if (step.hide) { return null; }
            
            const isActive = step.stepKey === activeKey;
            const stepNumber = index + 1;
            const isChecked = index < steps.findIndex(step => step.stepKey === activeKey);
            const isDisabled = step.isDisabled ?? false;
            
            return (
              <li key={step.stepKey} aria-current={isActive}>
                <Button
                  unstyled
                  nonactive={isDisabled} // Note: disabled steps should still be focusable, so use `nonactive` here
                  className={cx(
                    cl['bk-stepper__item'],
                    { [cl['bk-stepper__item--checked']]: isChecked },
                    { [cl['bk-stepper__item--disabled']]: isDisabled },
                    step.className,
                  )}
                  onPress={() => { onSwitch(step.stepKey); }}
                >
                  <span aria-label={`Step ${stepNumber}:`} className={cx(cl['bk-stepper__item__indicator'])}>
                    {isChecked
                      ? <Icon icon="check" className={cx(cl['bk-stepper__item__indicator__icon'])}/> 
                      : stepNumber
                    }
                  </span>
                  <span className={cx(cl['bk-stepper__item__title'])}>{step.title}</span>
                  {step.isOptional && <span className={cx(cl['bk-stepper__item__optional'])}>(Optional)</span>}
                </Button>
              </li>
            )
          })} */}
        </ol>
      </nav>
    );
  },
  {
    Step,
  },
);
