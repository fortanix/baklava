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
  const preventDefault = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);
  
  return (
    <IconButton
      {...props}
      // Prevent cursor shifting when clicking on actions (see also: https://github.com/mui/material-ui/issues/26007)
      onMouseDown={preventDefault}
      onMouseUp={preventDefault}
    />
  );
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
  
  /** Any additional actions to show after the input control. Use `<Input.Action/>` for a preset action element. */
  actions?: undefined | React.ReactNode,
  
  /**
   * Whether the textarea should resize automatically, with `field-sizing: content`.
   * Note that browser support is still somewhat limited:
   * https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
   */
    automaticResize?: undefined | boolean,
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
      automaticResize,
      ...propsRest
    } = props;
    
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // When the user clicks on the container, focus the input
    const handleContainerClick = React.useCallback((event: React.MouseEvent) => {
      // Note: make sure to exclude the input element itself, otherwise the user cannot click to move the cursor
      if (event.target !== inputRef.current) {
        event.preventDefault(); // Prevent the browser unfocusing the input right after this event is handled
        inputRef.current?.focus();
      }
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
      <div
        className={cx(
          'bk',
          { [cl['bk-input']]: !unstyled },
          { [cl['bk-input--automatic-resize']]: automaticResize },
          classx,
        )}
        onMouseDown={mergeCallbacks([handleContainerClick, propsRest.onMouseDown])}
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
