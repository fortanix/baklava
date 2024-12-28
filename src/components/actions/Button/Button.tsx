/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timeout } from '../../../util/time.ts';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Spinner } from '../../graphics/Spinner/Spinner.tsx';

import cl from './Button.module.scss';


export const internalSubmitSymbol = Symbol('baklava.Button.internalSubmit');

export { cl as ButtonClassNames };

export type ButtonProps = React.PropsWithChildren<Omit<ComponentProps<'button'>, 'type'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether to trim this component (strip any spacing around the element). */
  trimmed?: undefined | boolean,
  
  /**
   * The label of the button. Additional UI elements may be added, e.g. a loading indicator. If full control over
   * the button content is desired, use `children` instead, this overrides the `label`.
   */
  label?: undefined | string,
  
  /** What variant the button is, from higher prominance to lower. */
  variant?: undefined | 'primary' | 'secondary' | 'tertiary',
  
  /**
   * Whether the button is in "nonactive" state. This is a variant of `disabled`, but instead of completely graying
   * out the button, it only becomes a muted variation of the button's appearance. When true, also implies `disabled`.
   */
  nonactive?: undefined | boolean,
  
  /** Time (in ms) after which async actions will trigger a failure */
  asyncTimeout?: number,
  
  /** Event handler for button press events. */
  onPress?: undefined | (() => void | Promise<void>),
}>;
/**
 * Button component.
 */
export const Button = (props: ButtonProps) => {
  const {
    children,
    unstyled = false,
    trimmed = false,
    label,
    nonactive = false,
    variant = 'tertiary',
    onPress,
    asyncTimeout = 30_000,
    ...propsRest
  } = props;
  
  const [isPressPending, startPressTransition] = React.useTransition();
  
  const isPending = isPressPending;
  const isInteractive = !propsRest.disabled && !nonactive && !isPending;
  const isNonactive = nonactive || isPending;
  
  const handlePress = React.useCallback(() => {
    if (typeof onPress !== 'function') { return; }
    
    startPressTransition(async () => {
      await Promise.race([onPress(), timeout(asyncTimeout)]);
    });
  }, [onPress, asyncTimeout]);
  
  const handleClick = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // `onClick` should not be used in most cases, only if the consumer needs low level control over click events.
    // Instead, use `onPress` or a `<form>` component with `action`.
    props.onClick?.(event); // Call this first, to allow cancellation
    
    if (!isInteractive) { return; }
    
    if (typeof onPress === 'function') {
      event.preventDefault();
      handlePress();
    }
    
    // Fallback: trigger default browser action (e.g. form submit)
  }, [props.onClick, isInteractive, onPress, handlePress]);
  
  const renderContent = (): React.ReactNode => {
    // If `children` is specified, that overrides the button content
    if (children) {
      return children;
    }
    
    return (
      <>
        {isPending && <Spinner className="icon" inline/>}
        {label}
      </>
    );
  };
  
  // We do not support `type="submit"`, because we want to prevent accidental form submission without a proper form
  // context. Use `SubmitButton` instead.
  // biome-ignore lint/suspicious/noExplicitAny: `type` is not in the public type but can be there for internal use
  const type: unknown = (propsRest as any).type;
  let buttonType: undefined | 'submit' = undefined;
  
  if (type === 'submit') {
    throw new Error(`Button component cannot have type 'submit', use SubmitButton instead.`);
  }
  if (type === internalSubmitSymbol) { // Internal use only
    buttonType = 'submit';
  }
  
  // If both children and label are specified, use the `label` as the accessible name by default
  const accessibleName = typeof children !== 'undefined' && label ? label : undefined;
  
  return (
    <button
      aria-label={accessibleName}
      {...propsRest}
      type={buttonType} // Not overridable
      disabled={!isInteractive}
      className={cx({
        bk: true,
        [cl['bk-button']]: !unstyled,
        [cl['bk-button--trimmed']]: trimmed,
        [cl['bk-button--primary']]: variant === 'primary',
        [cl['bk-button--secondary']]: variant === 'secondary',
        [cl['bk-button--nonactive']]: isNonactive,
        [cl['bk-button--disabled']]: !isInteractive,
      }, props.className)}
      onClick={handleClick}
    >
      {renderContent()}
    </button>
  );
};
