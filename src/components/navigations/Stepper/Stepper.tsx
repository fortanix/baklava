/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, type ComponentProps, classNames as cx } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';

import cl from './Stepper.module.scss';

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

export type StepperProps = React.PropsWithChildren<ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Step items. */
  steps: Step[],
  
  /** Active key of step. */
  activeKey?: string,
  
  /** Whether this component should be displayed vertically or horizontally. */
  direction?: StepperDirection,
  
  /** Callback executed when active step is changed. */
  onSwitch: (stepKey: StepperKey) => void,
}>;
/**
 * A stepper component
 */
export const Stepper = (props: StepperProps) => {
  const { unstyled = false, steps = [], activeKey, direction = 'vertical', onSwitch, ...propsRest } = props;
  
  const handleKeyDown = (event: React.KeyboardEvent, stepKey: Step['stepKey']) => {
    if (event.key === 'Enter') {
      onSwitch(stepKey);
    }
  };
  
  return (
    <ul
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-stepper']]: !unstyled,
        [cl['bk-stepper--horizontal']]: direction === 'horizontal',
        [cl['bk-stepper--vertical']]: direction === 'vertical',
      }, propsRest.className)}
    >
      {steps.map((step, index) => {
        if (step.hide) return null;
        const isActive = step.stepKey === activeKey;
        const isChecked = index < steps.findIndex(step => step.stepKey === activeKey);
        return (
          <li
            role="tab"
            tabIndex={0}
            aria-selected={isActive ? 'true': 'false'}
            data-tab={step.stepKey}
            key={step.stepKey}
            className={cx({
              [cl['bk-stepper__item']]: true,
              [cl['bk-stepper__item--checked']]: isChecked,
            }, step.className)}
            onClick={() => { onSwitch(step.stepKey); }}
            onKeyDown={(event) => { handleKeyDown(event, step.stepKey); }}
          >
            <span className={cx(cl['bk-stepper__item__circle'])}>
              {isChecked
                ? <Icon icon="check" className={cx(cl['bk-stepper__item__circle__icon'])}/> 
                : index + 1
              }
            </span>
            <span className={cx(cl['bk-stepper__item__title'])}>{step.title}</span>
            {step.isOptional && <span className={cx(cl['bk-stepper__item__optional'])}>(Optional)</span>}
          </li>
        )
      })}
    </ul>
  );
};
