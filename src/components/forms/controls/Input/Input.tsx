/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { mergeRefs, mergeCallbacks } from '../../../../util/reactUtil.ts';
import * as InputUtil from '../../../util/input_util.tsx';

import { type IconName, Icon as IconDefault } from '../../../graphics/Icon/Icon.tsx';
import { IconButton } from '../../../actions/IconButton/IconButton.tsx';

import cl from './Input.module.scss';


export { cl as InputClassNames };

export type InputIconProps = Omit<ComponentProps<typeof IconDefault>, 'icon'> & {
  icon?: undefined | string, // Loosen `icon` constraint (for custom `Icon` components)
};

const InputAction = (props: React.ComponentProps<typeof IconButton>) => {
  const preventDefault = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);
  
  return (
    <IconButton
      {...props}
      className={cx('action-icon', props.className)}
      // Prevent cursor shifting when clicking on actions (see also: https://github.com/mui/material-ui/issues/26007)
      onMouseDown={preventDefault}
      onMouseUp={preventDefault}
    />
  );
};

type InputSpecificProps = Omit<InputUtil.InputSpecificProps, 'type'>;
type InputContainerProps = Omit<ComponentProps<'div'>, 'ref' | 'prefix' | keyof InputSpecificProps>;
export type InputProps = InputContainerProps & InputSpecificProps & {
  ref?: undefined | React.Ref<HTMLInputElement>,
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The type of the input. */
  type?: undefined | Exclude<ComponentProps<'input'>['type'], 'button' | 'submit' | 'reset'>,
  
  /** Props to apply to the container element. */
  containerProps?: React.ComponentProps<'div'>,
  
  /** Props to apply to the inner `<input/>` element. */
  inputProps?: React.ComponentProps<'input'>,
  
  /** A custom `Icon` component. */
  Icon?: undefined | React.ComponentType<InputIconProps>,
  
  /** An icon to show before the input. */
  icon?: undefined | IconName,
  
  /** The accessible name for the icon. */
  iconLabel?: undefined | string,
  
  /** Additional props to pass to the `Icon`. */
  iconProps?: undefined | Partial<InputIconProps>,
  
  /** Some prefilled content to be shown before the user input. */
  prefix?: undefined | React.ReactNode,
  
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
 * A text input control.
 */
export const Input = Object.assign(
  (props: InputProps) => {
    const {
      id,
      className,
      ref,
      unstyled = false,
      type = 'text',
      containerProps = {},
      inputProps = {},
      Icon = (IconDefault as React.ComponentType<InputIconProps>),
      icon,
      iconLabel,
      iconProps = {},
      prefix,
      actions,
      automaticResize,
      ...propsRest
    } = props;
    
    // Split props into container-specific and input-specific
    const propsExtracted = InputUtil.extractInputSpecificProps(propsRest);
    
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
    const bannedTypes = ['button', 'submit', 'image', 'reset'];
    if (bannedTypes.includes(type)) {
      throw new Error(`Input: unsupported type '${type}'.`);
    }
    if (inputProps.type && bannedTypes.includes(inputProps.type)) {
      throw new Error(`Input: unsupported type '${type}'.`);
    }
    
    // Note: this could be done with TypeScript, but Storybook types break when encountering `& ({ ... } | { ... })`
    if (icon && !iconLabel) {
      throw new Error(`When you specify an 'icon' on 'Input', you must also specify the 'iconLabel'.`);
    }
    
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: Visual-only convenience.
      <div
        {...containerProps}
        {...propsExtracted.containerProps}
        className={cx(
          'bk',
          { [cl['bk-input']]: !unstyled },
          { [cl['bk-input--automatic-resize']]: automaticResize },
          containerProps.className,
          className,
        )}
        onMouseDown={mergeCallbacks(
          [handleContainerClick, containerProps.onMouseDown, propsExtracted.containerProps.onMouseDown]
        )}
      >
        {(icon || Icon !== IconDefault) &&
          <Icon icon={icon} aria-label={iconLabel} {...iconProps} className={cx('input-icon', iconProps.className)}/>
        }
        {prefix}
        <input
          id={id}
          {...inputProps}
          {...propsExtracted.inputProps}
          ref={mergeRefs(inputRef, inputProps?.ref, ref)}
          type={type}
          className={cx(cl['bk-input__input'], inputProps?.className)}
        />
        {actions}
      </div>
    );
  },
  {
    Action: InputAction,
  },
);
