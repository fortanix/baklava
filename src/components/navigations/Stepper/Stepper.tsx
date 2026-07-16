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

// Recursively collect all step keys, including those inside React.Fragments.
// This is used to determine step order and completed steps.
const getStepKeys = (children: React.ReactNode): StepKey[] => {
  return React.Children.toArray(children).flatMap(child => {
    if (!React.isValidElement<StepProps>(child)) {
      return [];
    }

    if (child.type === React.Fragment) {
      return getStepKeys(child.props.children);
    }

    return [child.props.stepKey];
  });
}

const assignCounts = (children: React.ReactNode, nextCount: number, reverse = false): [React.ReactNode, number] => {
  const mappedChildren = React.Children.map(children, child => {
    if (!React.isValidElement<StepProps>(child)) {
      return child;
    }

    if (child.type === React.Fragment) {
      const [fragmentChildren, updatedCount] = assignCounts(child.props.children, nextCount, reverse);
      nextCount = updatedCount;

      return (
        <React.Fragment>
          {fragmentChildren}
        </React.Fragment>
      );
    }

    const count = child.props.count ?? nextCount;
    nextCount = reverse ? count - 1 : count + 1;

    return React.cloneElement(child, { count });
  });

  return [mappedChildren, nextCount];
};


type StepKey = string;

//
// Context
//

export type StepperContext = {
  activeStepKey: StepKey | undefined;
  setActiveStepKey: (stepKey: StepKey) => void;
  completedStepKeys: ReadonlySet<StepKey>;
  start: number;
  stepKeys: StepKey[];
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
  label: string;

  /** Additional content rendered below the label. */
  children?: React.ReactNode;

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
  const { activeStepKey, completedStepKeys, setActiveStepKey, stepKeys, start, } = useStepperContext();

  const isActive = activeStepKey === stepKey;

  const isCompleted = completedStepKeys.has(stepKey);
  const stepNumber = count ?? start;
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
      value={stepNumber}
    >
      <Button unstyled className={cx(cl['bk-stepper__step__action'])} onClick={handleClick} aria-disabled={disabled} disabled={disabled}>
        <span className={cx(cl['bk-stepper__step__indicator'])}>
          {isCompleted
            ? (<Icon icon="check" className={cx(cl['bk-stepper__step__indicator__icon'])} />)
            : stepNumber
          }
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
  activeStepKey?: undefined | StepKey;

  /** The default active step, in case no step has been explicitly selected through the URL. */
  defaultActiveStepKey?: undefined | StepKey,

  /** Callback executed when active step is changed. */
  onSwitch?: undefined | ((stepKey: StepKey) => void),

  /** The starting number of the list (if different from 1). Optional. */
  start?: undefined | number,

  /** Whether the ordered list should be rendered in reverse order. */
  reverse?: undefined | boolean;

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
      reverse = false,
      ...propsRest
    } = props;

    const scrollerProps = useScroller();
    const isControlled = controlledActiveStepKey !== undefined;
    const [uncontrolledActiveStepKey, setUncontrolledActiveStepKey] = React.useState(defaultActiveStepKey);

    const activeStepKey = isControlled ? controlledActiveStepKey : uncontrolledActiveStepKey;

    // Flattened list of all step keys in render order.
    const stepKeys = React.useMemo(
      () => getStepKeys(children),
      [children],
    );

    const activeIndex = stepKeys.indexOf(activeStepKey ?? '');

    // Every step before the active one is considered completed.
    const completedStepKeys = React.useMemo(() => {
      if (activeIndex < 0) {
        return new Set<StepKey>();
      }

      return new Set(stepKeys.slice(0, activeIndex));
    }, [stepKeys, activeIndex]);

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
        start: start ?? 1,
        stepKeys,
      }),
      [activeStepKey, completedStepKeys, handleSetActiveStepKey, start, stepKeys],
    );

    const [childrenWithCounts] = React.useMemo(
      () => assignCounts(children, start ?? 1, reverse),
      [children, start, reverse],
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
          <div className={cx("connector-line")}></div>
          <ol start={start} reversed={reverse}>
            {childrenWithCounts}
          </ol>
        </nav>
      </StepperContext>
    );
  },
  {
    Step,
  },
);
