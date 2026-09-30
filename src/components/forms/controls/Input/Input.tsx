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
  /**
   * By default, the `ref` will be linked to the inner input element. To get a ref to the container, use
   * `containerProps.ref`.
   */
  ref?: undefined | React.Ref<HTMLInputElement>,
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The type of the input. Note: submit buttons are not supported here, use `SubmitButton` instead. */
  type?: undefined | Exclude<ComponentProps<'input'>['type'], 'button' | 'submit' | 'image' | 'reset'>,
  
  /**
   * Form value. If not `undefined`, will override `value` for the internal form-associated value of this input.
   * - When `null`, will not render any input (hence `FormData` will return `undefined` for that field name).
   * - When `string` (even if empty string), will render a single input with field name = `${name}`.
   * - When `Array` (even if empty array), will render one hidden input per element with field name = `${name}[]`.
   */
  formValue?: undefined | null | string | Array<string>,
  
  /** Whether the input should resize automatically to fit the content. Default: `false`. */
  automaticResize?: undefined | boolean,
  
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
  
  /** Props to apply to the container element. */
  containerProps?: React.ComponentProps<'span'>,
  
  /** Props to apply to the inner `<input/>` element. */
  inputProps?: React.ComponentProps<'input'>,
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
      
      // Form-association props
      name,
      form,
      formValue,
      
      automaticResize = false,
      Icon = (IconDefault as React.ComponentType<InputIconProps>),
      icon,
      iconLabel,
      iconProps = {},
      prefix,
      actions,
      containerProps = {},
      inputProps = {},
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
    
    // Form association logic
    const useHiddenFormValue = typeof formValue !== 'undefined';
    const formAssociationProps = { form, name };
    const renderHiddenFormAssociation = (formValue: string | Array<string>, props: typeof formAssociationProps) => {
      if (Array.isArray(formValue)) {
        return formValue.map((value, index) =>
          // biome-ignore lint/suspicious/noArrayIndexKey: There is no other unique key available.
          <input key={index} {...props} name={`${props.name}[]`} type="hidden" value={value}/>
        );
      } else {
        return <input {...props} type="hidden" value={formValue}/>;
      }
    };
    
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: Visual-only convenience.
      <span
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
          {...useHiddenFormValue ? {} : formAssociationProps}
          ref={mergeRefs(inputRef, inputProps?.ref, ref)}
          type={type}
          className={cx(cl['bk-input__input'], inputProps?.className)}
        />
        {actions}
        
        {useHiddenFormValue && renderHiddenFormAssociation(formValue, formAssociationProps)}
      </span>
    );
  },
  {
    Action: InputAction,
  },
);
