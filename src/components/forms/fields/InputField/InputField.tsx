/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';
import { useFormStatus } from 'react-dom';

import { useFormContext } from '../../context/Form/Form.tsx';
import { Input } from '../../controls/Input/Input.tsx';

import cl from './InputField.module.scss';


export { cl as InputFieldClassNames };

export type InputFieldProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Label for the input. */
  label?: undefined | React.ReactNode,
  
  /** Props for the `<label>` element, if `label` is defined. */
  labelProps?: undefined | ComponentProps<'label'>,
  
  /** Props for the wrapper element. */
  wrapperProps?: undefined | ComponentProps<'div'>,
};
/**
 * Input field.
 */
export const InputField = (props: InputFieldProps) => {
  const {
    unstyled = false,
    label,
    labelProps = {},
    wrapperProps = {},
    ...inputProps
  } = props;
  
  const controlId = React.useId();
  const formContext = useFormContext();
  //const formStatus = useFormStatus();
  
  return (
    <div
      {...wrapperProps}
      className={cx(
        'bk',
        { [cl['bk-input-field']]: !unstyled },
        wrapperProps.className,
      )}
    >
      {label &&
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-input-field__label'], labelProps.className)}
        >
          {label}
        </label>
      }
      <Input
        {...inputProps}
        id={controlId}
        form={formContext.formId}
        className={cx(cl['bk-input-field__control'], inputProps.className)}
      />
    </div>
  );
};
