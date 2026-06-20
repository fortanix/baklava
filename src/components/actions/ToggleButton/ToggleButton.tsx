/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { usePrevious } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Button } from '../Button/Button.tsx';

import cl from './ToggleButton.module.scss';


export { cl as ToggleButtonClassNames };

type ButtonPropsIrrelevant = 'unstyled' | 'trimmed' | 'kind' | 'variant' | 'asyncTimeout';
type ToggleButtonProps = Omit<ComponentProps<typeof Button>, ButtonPropsIrrelevant> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Note: currently only supports `small`, but we may introduce a 'medium' default in the future. Make this field
  // required for now so that we can change the default later.
  /** The size of the component. */
  size: 'small',
  
  /** Whether to display the toggle button as "embedded": no borders/shadows will be rendered. Default: `false`. */
  embedded?: undefined | boolean,
  
  /** Whether the button is currently in toggled state. If `undefined`, the toggle button will be uncontrolled. */
  toggled?: undefined | boolean,
  
  /** When uncontrolled, specifies the default toggled state. Default: `false`. */
  toggledDefault?: undefined | boolean,
  
  /** Callback that is called when the toggled state changes. */
  onToggledChange?: undefined | ((toggled: boolean) => void),
};
export const ToggleButton = (props: ToggleButtonProps) => {
  const {
    unstyled,
    size = 'small',
    embedded,
    toggled,
    toggledDefault = false,
    onToggledChange,
    disabled,
    nonactive,
    ...propsRest
  } = props;
  
  const isControlled = typeof toggled !== 'undefined';
  if (isControlled && typeof toggledDefault !== 'undefined') {
    console.warn('[ToggleButton] `toggledDefault` passed to controlled component');
  }
  if (isControlled && typeof onToggledChange === 'undefined') {
    console.warn('[ToggleButton] Missing `onToggledChange` in controlled component');
  }
  
  const isControlledPrev = usePrevious(isControlled);
  // biome-ignore lint/correctness/useExhaustiveDependencies(isControlledPrev): Do not re-run effect on prev change
  React.useEffect(() => {
    if (typeof isControlledPrev !== 'undefined' && isControlled !== isControlledPrev) {
      const change = isControlled ? `uncontrolled to controlled` : `controlled to uncontrolled`;
      console.warn(`[ToggleButton] Component switched from ${change}`);
    }
  }, [isControlled]);
  
  
  const [isToggled, setIsToggled] = React.useState(toggled ?? toggledDefault);
  
  React.useEffect(() => {
    if (isControlled) { onToggledChange?.(isToggled); }
  }, [isControlled, isToggled, onToggledChange]);
  
  const isInteractive = !disabled && !nonactive;
  const handlePress = React.useCallback(() => {
    if (!isInteractive) { return; }
    
    setIsToggled(toggled => !toggled);
    propsRest.onPress?.();
  }, [isInteractive, propsRest.onPress]);
  
  // By default we consider this to be a toggle button, i.e. `role="button"` with `aria-pressed`. But if the consumer
  // uses this component as one of the below roles then we should use `aria-checked` instead.
  const isCheckable = typeof propsRest.role === 'string' && [
    'checkbox',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'radio',
    'switch',
  ].includes(propsRest.role);
  
  return (
    <Button
      wrap={false}
      aria-pressed={isCheckable ? undefined : isToggled}
      aria-checked={isCheckable ? isToggled : undefined}
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-toggle-button']]: !unstyled },
        { [cl['bk-toggle-button--small']]: size === 'small' },
        { [cl['bk-toggle-button--embedded']]: embedded },
        { [cl['bk-toggle-button--nonactive']]: nonactive },
        propsRest.className,
      )}
      onPress={handlePress}
      disabled={disabled}
      nonactive={nonactive}
    />
  );
};
