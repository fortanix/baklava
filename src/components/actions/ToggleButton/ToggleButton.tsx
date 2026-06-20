/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { mergeCallbacks, useControllableState } from '../../../util/reactUtil.ts';
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
  
  /** Callback that is called when the toggled state changes. If `toggled` is controlled, should not be `undefined`. */
  onToggledChange?: undefined | ((toggled: boolean) => void),
};
export const ToggleButton = (props: ToggleButtonProps) => {
  const {
    unstyled,
    size = 'small',
    embedded,
    toggled,
    toggledDefault,
    onToggledChange,
    disabled,
    nonactive,
    ...propsRest
  } = props;
  
  const { state: isToggled, setState: setIsToggled } = useControllableState<boolean>({
    componentName: 'ToggleButton',
    propName: 'toggled',
    state: toggled,
    stateDefault: toggledDefault,
    stateFallback: false,
    onStateChange: onToggledChange,
  });
  
  const isInteractive = !disabled && !nonactive;
  const handlePress = () => {
    if (isInteractive) {
      setIsToggled(toggled => !toggled);
    }
  };
  
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
      onPress={mergeCallbacks([propsRest.onPress, handlePress])}
      disabled={disabled}
      nonactive={nonactive}
    />
  );
};
