/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timeout } from '../../../util/time.ts';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { type IconName, Icon } from '../../graphics/Icon/Icon.tsx';
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
  
  /** An icon to show before the label. Optional. */
  icon?: undefined | IconName,
  
  /** The kind of button, from higher prominance to lower. */
  kind?: undefined | 'primary' | 'secondary' | 'tertiary',
  
  /**
   * Which visual variant to use. Default: 'normal'.
   */
  variant?: undefined | 'normal',
  
  /**
   * Whether the button is disabled. This is meant for essentially permanent disabled buttons, not for buttons that
   * are just temporarily non-interactive. Use `nonactive` for the latter. Disabled buttons cannot be focused.
   */
  disabled?: undefined | boolean,
  
  /**
   * Whether the button is in "nonactive" state. This is a variant of `disabled`, but instead of completely graying
   * out the button, it only becomes a muted variation of the button's appearance. Nonactive buttons are useful for
   * temporarily states such as while an action is currently ongoing. Nonactive buttons are still focusable.
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
    icon,
    kind = 'tertiary',
    variant = 'normal',
    disabled = false,
    nonactive = false,
    onPress,
    asyncTimeout = 30_000,
    ...propsRest
  } = props;
  
  const [isPressPending, startPressTransition] = React.useTransition();
  
  const isPending = isPressPending;
  const isInteractive = !disabled && !nonactive && !isPending;
  const isNonactive = nonactive || isPending;
  
  const handlePress = React.useCallback(() => {
    if (typeof onPress !== 'function') { return; }
    
    const onPressResult = onPress();
    
    // Note: do not start a transition unless `onPress` is actually async, because otherwise sync press actions
    // will cause a brief rerender with disabled state and loading indicator, which messes with things like
    // button focus.
    if (onPressResult instanceof Promise) {
      startPressTransition(async () => {
        await Promise.race([onPressResult, timeout(asyncTimeout)]);
      });
    }
  }, [onPress, asyncTimeout]);
  
  const handleClick = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!isInteractive) { return; }
    
    // `onClick` should not be used in most cases, only if the consumer needs low level control over click events.
    // Instead, use `onPress` or a `<form>` component with `action`.
    props.onClick?.(event); // Call this first, to allow cancellation
    
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
        {icon && <Icon className="icon" icon={icon}/>}
        {label}
      </>
    );
  };
  
  // We do not support `type="submit"`, because we want to prevent accidental form submission without a proper form
  // context. Use `SubmitButton` instead.
  // biome-ignore lint/suspicious/noExplicitAny: `type` is not in the public type but can be there for internal use
  const type: unknown = (propsRest as any).type;
  let buttonType: 'button' | 'submit' = 'button';
  
  if (type === 'submit') {
    throw new Error(`Button component cannot have type 'submit', use SubmitButton instead.`);
  }
  if (type === internalSubmitSymbol) { // Internal use only
    buttonType = 'submit';
  }
  
  return (
    <button
      aria-disabled={isInteractive ? undefined : true}
      disabled={disabled}
      {...propsRest}
      type={buttonType} // Not overridable
      className={cx({
        bk: true,
        [cl['bk-button']]: !unstyled,
        [cl['bk-button--trimmed']]: trimmed,
        [cl['bk-button--primary']]: kind === 'primary',
        [cl['bk-button--secondary']]: kind === 'secondary',
        [cl['bk-button--tertiary']]: kind === 'tertiary',
        [cl['bk-button--disabled']]: !isInteractive,
        [cl['bk-button--nonactive']]: isNonactive,
        'nonactive': isNonactive, // Global class name so that consumers can style nonactive states
      }, props.className)}
      onClick={handleClick}
    >
      {renderContent()}
    </button>
  );
};
