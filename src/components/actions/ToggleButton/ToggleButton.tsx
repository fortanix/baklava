/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeCallbacks, usePrevious } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Button } from '../Button/Button.tsx';

import cl from './ToggleButton.module.scss';


export { cl as ToggleButtonClassNames };


type ButtonPropsIrrelevant = 'kind' | 'trimmed' | 'asyncTimeout';
type ToggleButtonProps = Omit<ComponentProps<typeof Button>, ButtonPropsIrrelevant> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether to display the toggle button as "embedded": no borders/shadows will be rendered. Default: `false`. */
  embedded?: undefined | boolean,
  
  /** Whether the button is currently in active state. If `undefined`, the toggle button will be uncontrolled. */
  active?: undefined | boolean,
  
  /** When uncontrolled, specifies the default active state. Default: `false`. */
  activeDefault?: undefined | boolean,
  
  /** Callback that is called when the active state changes. */
  onActiveChange?: undefined | ((active: boolean) => void),
};
export const ToggleButton = (props: ToggleButtonProps) => {
  const {
    unstyled,
    embedded,
    active,
    activeDefault = false,
    onActiveChange,
    disabled,
    nonactive,
    ...propsRest
  } = props;
  
  const isControlled = typeof active !== 'undefined';
  if (isControlled && typeof activeDefault !== 'undefined') {
    console.warn('[ToggleButton] `activeDefault` passed to controlled component');
  }
  if (isControlled && typeof onActiveChange === 'undefined') {
    console.warn('[ToggleButton] Missing `onActiveChange` in controlled component');
  }
  
  const isControlledPrev = usePrevious(isControlled);
  // biome-ignore lint/correctness/useExhaustiveDependencies(isControlledPrev): Do not re-run effect on prev change
  React.useEffect(() => {
    if (typeof isControlledPrev !== 'undefined' && isControlled !== isControlledPrev) {
      const change = isControlled ? `uncontrolled to controlled` : `controlled to uncontrolled`;
      console.warn(`[ToggleButton] Component switched from ${change}`);
    }
  }, [isControlled]);
  
  
  const [isActive, setIsActive] = React.useState(active ?? activeDefault);
  
  React.useEffect(() => {
    if (isControlled) { onActiveChange?.(isActive); }
  }, [isControlled, isActive, onActiveChange]);
  
  const isInteractive = !disabled && !nonactive;
  const handlePress = React.useCallback(() => {
    setIsActive(active => {
      if (!isInteractive) { return active; }
      return !active;
    });
  }, [isInteractive]);
  
  return (
    <div>
    <Button
      unstyled
      // TODO: set `aria-checked` instead if `role` is passed as "radio"?
      aria-pressed={isActive}
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-toggle-button']]: !unstyled },
        { [cl['bk-toggle-button--embedded']]: embedded },
        propsRest.className,
      )}
      onPress={mergeCallbacks([propsRest.onPress, handlePress])}
      disabled={disabled}
      nonactive={nonactive}
    />
    </div>
  );
};
