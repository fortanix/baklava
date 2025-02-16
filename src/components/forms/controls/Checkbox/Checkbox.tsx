/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import cl from './Checkbox.module.scss';


export { cl as CheckboxClassNames };

export type CheckboxState = boolean;

export type CheckboxProps = Omit<ComponentProps<'input'>, 'defaultChecked' | 'checked'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The default state of the checkbox at initialization time. Default: undefined. */
  defaultChecked?: undefined | CheckboxState,
  
  /**
   * The current state of the checkbox. If `undefined`, the component is considered uncontrolled.
   */
  checked?: undefined | CheckboxState,
  
  /** Callback for update events, will be called with the new state of the checkbox. */
  onUpdate?: undefined | ((checked: CheckboxState) => void),
  
  /** The human-readable label for this checkbox. */
  label?: undefined | React.ReactNode,
  
  /** Any additional props to pass on the `<label>` element. */
  labelProps?: undefined | React.ComponentProps<'label'>,
};
/**
 * A checkbox control is a basic on/off toggle.
 */
export const Checkbox = (props: CheckboxProps) => {
  const { unstyled = false, label, labelProps = {}, ...propsRest } = props;
  
  const id = React.useId();
  
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    props.onUpdate?.(event.target.checked);
  }, [props.onUpdate]);
  
  /*
  Reasons the below is problematic:
  - Can cause issues if the internal structure changes just based on the presence of a `label` prop.
    > Also: `className` prop moving around dynamically
  - Means that consumer's `id` may or may not work, depending on whether the `label` prop is there (confusing!)
  - Awkward with BEM: is `bk-checkbox` the parent? Or is it a child? What do we call the label if not `bk-checkbox`?
  - Implementation sufficiently complex that we have to duplicate the entire `<input>` definition... good sign that
    this should probably be a separate component.
  - The `label` wrapping pattern is likely to be common for several controls, so this is all duplication.
  */
  
  if (label) {
    return (
      <label htmlFor={id} {...labelProps}>
        <input
          id={id}
          type="checkbox"
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-checkbox']]: !unstyled },
            propsRest.className,
          )}
          onChange={mergeCallbacks([props.onChange, handleChange])}
        />
        <span className={cl['bk-checkbox__label__text']}>
          {label}
        </span>
      </label>
    );
  } else {
    return (
      <input
        //id={id} // No need to specify the `id` if there is no `<label>`
        type="checkbox"
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-checkbox']]: !unstyled },
          propsRest.className,
        )}
        onChange={mergeCallbacks([props.onChange, handleChange])}
      />
    );
  }
};
