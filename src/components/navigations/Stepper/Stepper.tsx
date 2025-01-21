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

export { cl as SteppersClassNames };

export type Step = {
  stepKey: string,
  title: React.ReactNode,
  className?: ClassNameArgument,
  hide?: boolean,
  isOptional?: boolean,
};
export type StepperKey = Step['stepKey'];
export type StepperDirection = 'vertical' | 'horizontal';

export type StepperProps = React.PropsWithChildren<ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Step items. */
  steps: Array<Step>,
  
  /** Active key of step. */
  activeKey?: undefined | string,
  
  /** Whether this component should be displayed vertically or horizontally. */
  direction?: undefined | StepperDirection,
  
  /** Callback executed when active step is changed. */
  onSwitch: (stepKey: StepperKey) => void,
}>;
/**
 * A stepper component
 */
export const Stepper = (props: StepperProps) => {
  const { unstyled = false, steps = [], activeKey, direction = 'vertical', onSwitch, ...propsRest } = props;
  
  return (
    <nav
      aria-label="Steps" // Recommendation is to override this per usage
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-stepper']]: !unstyled },
        { [cl['bk-stepper--horizontal']]: direction === 'horizontal' },
        { [cl['bk-stepper--vertical']]: direction === 'vertical' },
        propsRest.className,
      )}
    >
      <ol>
        {steps.map((step, index) => {
          if (step.hide) return null;
          const isActive = step.stepKey === activeKey;
          const stepNumber = index + 1;
          const isChecked = index < steps.findIndex(step => step.stepKey === activeKey);
          return (
            <li key={step.stepKey} aria-current={isActive}>
              <Button
                unstyled
                //nonactive={!isActive} // Note: the buttons *look* nonactive, but are actually clickable
                className={cx(
                  cl['bk-stepper__item'],
                  { [cl['bk-stepper__item--checked']]: isChecked },
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
        })}
      </ol>
    </nav>
  );
};
