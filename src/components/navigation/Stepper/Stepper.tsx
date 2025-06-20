/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ComponentProps, classNames as cx } from '../../../util/componentUtil.ts';
import {
  type ParserMap,
  type UseQueryStateReturn,
  useQueryState,
  createSerializer,
  parseAsString,
} from 'nuqs';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Link } from '../../actions/Link/Link.tsx';

import cl from './Stepper.module.scss';


/*
References:
- [WAI-multi-page] https://www.w3.org/WAI/tutorials/forms/multi-page/#using-step-by-step-indicator
- [MDN-aria-current] https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- [SO-1] https://stackoverflow.com/questions/52932018/making-a-step-progress-indicator-accessible-for-screen-readers
- https://www.aditus.io/aria/aria-current
- https://www.telerik.com/design-system/docs/components/stepper/accessibility
- https://cauldron.dequelabs.com/components/Stepper

Accessibility notes:
- Should be structured as an `<ol>` with a list of links.
- Should be wrapped inside a `<nav>` with an `aria-label` (unique in the page).
- `aria-current="step"` should be applied to the `<li>` that is the currently active step.
- Some `class="visually-hidden"` text elements should be added to each step to clarify the state (e.g. "Completed").
*/

export { cl as StepperClassNames };

/*
type Step = {
  stepKey: string,
  title: React.ReactNode,
  className?: undefined | ClassNameArgument,
  hide?: undefined | boolean,
  isOptional?: undefined | boolean,
  isDisabled?: undefined | boolean,
};
type StepperKey = Step['stepKey'];
*/

type StepperKey = string;
type StepKey = string;


//
// URL state
//

type UseActiveStepResult = {
  activeStepKey: null | StepKey,
  setActiveStepKey: UseQueryStateReturn<null | StepKey, null | StepKey>[1],
  serializer: ReturnType<typeof createSerializer<ParserMap>>,
};
const useActiveStep = (context: StepperContext): UseActiveStepResult => {
  const serializer = React.useMemo(() => createSerializer({
    //step: parseAsStringLiteral(['foo', 'bar'] as const),
    [context.stepperKey]: parseAsString,
  }), [context.stepperKey]);
  
  const [activeStepKey, setActiveStepKey] = useQueryState(context.stepperKey, {
    ...(typeof context.defaultActiveStepKey === 'string' ? { defaultValue: context.defaultActiveStepKey } : {}),
    history: 'push',
  });
  
  return { activeStepKey, setActiveStepKey, serializer };
};


//
// Context
//

export type StepperContext = {
  stepperKey: StepperKey,
  defaultActiveStepKey: undefined | StepKey,
};
export const StepperContext = React.createContext<null | StepperContext>(null);
export const useStepperContext = () => {
  const context = React.use(StepperContext);
  if (context === null) { throw new Error(`Missing StepperContext provider`); }
  
  // React.useEffect(() => {
  //   return context.register(stepDef);
  // }, [context.register, stepDef]);
  
  return context;
};


//
// Components
//

type StepProps = ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The key for this step, should be unique within the `Stepper` component. */
  stepKey: StepKey,
  
  /** The human-readable name for this step. */
  label: string,
  
  /** Whether this step should be disabled. Default: `false`. */
  disabled?: undefined | boolean,
};
export const Step = (props: StepProps) => {
  const {
    children,
    unstyled,
    stepKey,
    label,
    disabled = false,
    ...propsRest
  } = props;
  
  const context = useStepperContext();
  
  const { activeStepKey, serializer } = useActiveStep(context);
  
  const isActive = activeStepKey === stepKey;
  const isCompleted = false; // TODO
  
  const url = serializer(new URL(window.location.href), { [context.stepperKey]: stepKey });
  
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [disabled]);
  
  return (
    <li
      aria-current={isActive ? 'step' : undefined}
      {...propsRest}
      className={cx(
        { [cl['bk-stepper__step']]: !unstyled },
        propsRest.className,
      )}
      //value={count}
    >
      <Link unstyled className={cx(cl['bk-stepper__step__action'])} href={url}>
        <span className={cx(cl['bk-stepper__step__indicator'])}>
          {isCompleted &&
            <Icon icon="check" className={cx(cl['bk-stepper__step__indicator__icon'])}/>
          }
        </span>
        <span className={cx(cl['bk-stepper__step__label'])}>
          {isCompleted && <span className="visually-hidden">Completed:</span>}
          {isActive && <span className="visually-hidden">Current:</span>}
          {label}
        </span>
      </Link>
    </li>
  );
};

type StepperProps = ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The key for this stepper, should be unique within the page. */
  stepperKey: StepperKey,
  
  /** A unique human-readable name for this landmark. Required. */
  label: string,
  
  /** Whether this component should be displayed vertically or horizontally. Default: `"vertical"`. */
  orientation?: undefined | 'vertical' | 'horizontal',
  
  /** The default active step, in case no step has been explicitly selected through the URL. */
  defaultActiveStepKey?: undefined | StepKey,
  
  /** Callback executed when active step is changed. */
  onSwitch?: undefined | ((stepKey: StepKey) => void),
  
  /** The starting number of the list (if different from 1). Optional. */
  start?: undefined | number,
};
/**
 * Stepper: a navigation component displaying a numbered list, representing progress through some multi-part UI flow.
 */
export const Stepper = Object.assign(
  (props: StepperProps) => {
    const {
      children,
      unstyled = false,
      stepperKey,
      label,
      orientation = 'vertical',
      defaultActiveStepKey,
      onSwitch,
      start,
      ...propsRest
    } = props;
    
    const stepperContext = React.useMemo(() => ({
      stepperKey,
      defaultActiveStepKey,
    }), [stepperKey, defaultActiveStepKey]);
    
    const { activeStepKey } = useActiveStep(stepperContext);
    
    // biome-ignore lint/correctness/useExhaustiveDependencies: Do not include `onSwitch` as dependency.
    React.useEffect(() => {
      if (typeof activeStepKey === 'string') {
        onSwitch?.(activeStepKey);
      }
    }, [activeStepKey]);
    
    return (
      <StepperContext value={stepperContext}>
        <nav
          {...propsRest}
          aria-label={label ?? 'Steps'} // Must be unique within the page
          className={cx(
            'bk',
            { [cl['bk-stepper']]: !unstyled },
            { [cl['bk-stepper--vertical']]: orientation === 'vertical' },
            { [cl['bk-stepper--horizontal']]: orientation === 'horizontal' },
            propsRest.className,
          )}
        >
          <ol start={start}>
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
      </StepperContext>
    );
  },
  {
    Step,
  },
);
