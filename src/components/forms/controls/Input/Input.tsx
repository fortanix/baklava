/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { ClassNameArgument, classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { mergeRefs, mergeCallbacks } from '../../../../util/reactUtil.ts';

import { type IconName, Icon } from '../../../graphics/Icon/Icon.tsx';
import { IconButton } from '../../../actions/IconButton/IconButton.tsx';

import cl from './Input.module.scss';


export { cl as InputClassNames };

const InputAction = (props: React.ComponentProps<typeof IconButton>) => {
  return <IconButton {...props}/>;
};

export type InputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Class name to apply to the outer container. */
  classx?: undefined | ClassNameArgument,
  
  /** The type of the input. */
  type?: undefined | Exclude<ComponentProps<'input'>['type'], 'button' | 'submit' | 'reset'>,
  
  /** An icon to show before the input. */
  icon?: undefined | IconName,

  /** The accessible name for the icon. */
  iconLabel?: undefined | string,
  
  actions?: undefined | React.ReactNode,
};
/**
 * Input control.
 */
export const Input = Object.assign(
    (props: InputProps) => {
    const {
      unstyled = false,
      classx,
      type = 'text',
      icon,
      iconLabel,
      actions,
      ...propsRest
    } = props;
    
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    const handleContainerClick = React.useCallback(() => {
      inputRef.current?.focus();
    }, []);
    
    // Prevent inputs from being used as (form submit) buttons
    //if (type === 'button' || type === 'submit' || type === 'image' || type === 'reset') {
    if (['button', 'submit', 'image', 'reset'].includes(type)) {
      throw new Error(`Input: unsupported type '${type}'.`);
    }
    
    // Note: this could be done with TypeScript, but Storybook types break when encountering `& ({ ... } | { ... })`
    if (icon && !iconLabel) {
      throw new Error(`When you specify an 'icon' on 'Input', you must also specify the 'iconLabel'.`);
    }
    
    return (
      // The container is not (and should not be) interactive/focusable, the `onClick` is a visual only convenience.
      // biome-ignore lint/a11y/useKeyWithClickEvents: See above.
      <div
        className={cx(
          'bk',
          { [cl['bk-input']]: !unstyled },
          classx,
        )}
        onClick={mergeCallbacks([handleContainerClick, propsRest.onClick])}
      >
        {icon && <Icon icon={icon} aria-label={iconLabel}/>}
        <input
          {...propsRest}
          ref={mergeRefs(inputRef, propsRest.ref)}
          type={type}
          className={cx(cl['bk-input__input'], propsRest.className)}
        />
        {actions}
      </div>
    );
  },
  {
    Action: InputAction,
  },
);
