/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ComponentProps, classNames as cx } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import { useScroller } from '../../../layouts/util/Scroller.tsx';
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



export type StepKey = string;

//
// Context
//

export type StepperContext = {
  activeStepKey: StepKey | undefined,
  setActiveStepKey: (stepKey: StepKey) => void,
  completedStepKeys: ReadonlySet<StepKey>,
};
export const StepperContext = React.createContext<null | StepperContext>(null);
export const useStepperContext = () => {
  const context = React.use(StepperContext);
  if (context === null) { throw new Error(`Missing StepperContext provider`); }

  return context;
};


//
// Components
//

type StepProps = Omit<ComponentProps<'li'>, 'children'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The key for this step, should be unique within the `Stepper` component. */
  stepKey: StepKey,

  /** The human-readable name for this step. */
  label: string,

  /** Additional content rendered below the label. */
  children?: React.ReactNode,

  /** Override the displayed step number. */
  count?: undefined | number;

  /** Whether this step should be disabled. Default: `false`. */
  disabled?: undefined | boolean,
};

export const Step = (props: StepProps) => {
  const {
    children,
    unstyled,
    stepKey,
    label,
    count,
    disabled = false,
    ...propsRest
  } = props;
  const { activeStepKey, completedStepKeys, setActiveStepKey } = useStepperContext();

  const isActive = activeStepKey === stepKey;

  const isCompleted = completedStepKeys.has(stepKey);
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      setActiveStepKey(stepKey);
    },
    [disabled, stepKey, setActiveStepKey],
  );

  return (
    <li
      aria-current={isActive ? 'step' : undefined}
      {...propsRest}
      className={cx(
        { [cl['bk-stepper__step']]: !unstyled },
        { [cl['bk-stepper__step--completed']]: isCompleted },
        { [cl['bk-stepper__step--disabled']]: disabled },
        propsRest.className,
      )}
      style={{
        // Chrome v150 has a bug where counter doesn't auto set when count is provided but not v152, 
        // This should be removed once browser support is good enough.
        counterSet: typeof count === 'number' ? `list-item ${count}` : undefined,
        ...propsRest.style,
      }}
      value={count}
    >
      <Button unstyled className={cx(cl['bk-stepper__step__action'])} onClick={handleClick} aria-disabled={disabled} disabled={disabled}>
        <span className={cx(cl['bk-stepper__step__indicator'])}>
          {isCompleted && (<Icon icon="check" className={cx(cl['bk-stepper__step__indicator__icon'])} />)}
        </span>
        <span className={cx(cl['bk-stepper__step__label'])}>{label}</span>
      </Button>
      {children && (
        <div className={cx(cl['bk-stepper__step__body'])}>
          {children}
        </div>
      )}
    </li>
  );
};

type StepperProps = ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** A unique human-readable name for this landmark. Required. */
  label: string,

  /** Whether this component should be displayed vertically or horizontally. Default: `"vertical"`. */
  orientation?: undefined | 'vertical' | 'horizontal',

  /** Controlled active step. */
  activeStepKey?: undefined | StepKey,

  /** The default active step, in case no step has been explicitly selected through the URL. */
  defaultActiveStepKey?: undefined | StepKey,

  /** Callback executed when active step is changed. */
  onSwitch?: undefined | ((stepKey: StepKey) => void),

  /** The starting number of the list (if different from 1). Optional. */
  start?: undefined | number,

  /** Whether the ordered list should be rendered in reverse order. */
  reversed?: undefined | boolean,

};

/**
 * Stepper: a navigation component displaying a numbered list, representing progress through some multi-part UI flow.
 */
export const Stepper = Object.assign(
  (props: StepperProps) => {
    const {
      children,
      unstyled = false,
      label,
      orientation = 'vertical',
      activeStepKey: controlledActiveStepKey,
      defaultActiveStepKey,
      onSwitch,
      start,
      reversed = false,
      ...propsRest
    } = props;

    const scrollerProps = useScroller();
    const isControlled = controlledActiveStepKey !== undefined;
    const [uncontrolledActiveStepKey, setUncontrolledActiveStepKey] = React.useState(defaultActiveStepKey);

    const activeStepKey = isControlled ? controlledActiveStepKey : uncontrolledActiveStepKey;

    const stepKeys = React.useMemo(() => {
      const keys: StepKey[] = [];

      React.Children.forEach(children, child => {
        if (!React.isValidElement<StepProps>(child)) {
          return;
        }

        if (child.type === React.Fragment) {
          React.Children.forEach(child.props.children, nested => {
            if (React.isValidElement<StepProps>(nested)) {
              keys.push(nested.props.stepKey);
            }
          });
          return;
        }

        keys.push(child.props.stepKey);
      });

      return keys;
    }, [children]);

    const activeIndex = stepKeys.indexOf(activeStepKey ?? '');

    // Every step before the active one is considered completed.
    const completedStepKeys = React.useMemo(
      () => new Set(stepKeys.slice(0, activeIndex)),
      [stepKeys, activeIndex],
    );

    const handleSetActiveStepKey = React.useCallback(
      (stepKey: StepKey) => {
        if (!isControlled) {
          setUncontrolledActiveStepKey(stepKey);
        }

        onSwitch?.(stepKey);
      },
      [isControlled, onSwitch],
    );

    const stepperContext = React.useMemo(
      () => ({
        activeStepKey,
        completedStepKeys,
        setActiveStepKey: handleSetActiveStepKey,
      }),
      [activeStepKey, completedStepKeys, handleSetActiveStepKey],
    );

    return (
      <StepperContext value={stepperContext}>
        <nav
          {...propsRest}
          aria-label={label ?? 'Steps'} // Must be unique within the page
          {...(orientation === 'horizontal' ? scrollerProps : {})}
          className={cx(
            'bk',
            { [cl['bk-stepper']]: !unstyled },
            { [cl['bk-stepper--vertical']]: orientation === 'vertical' },
            { [cl['bk-stepper--horizontal']]: orientation === 'horizontal' },
            propsRest.className,
          )}
        >
          <ol start={start} reversed={reversed}>
            {children}
          </ol>
        </nav>
      </StepperContext>
    );
  },
  {
    Step,
  },
);
