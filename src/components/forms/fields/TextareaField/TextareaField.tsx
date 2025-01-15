/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { Textarea } from '../../controls/Textarea/Textarea.tsx';

import cl from './TextareaField.module.scss';


export { cl as TextareaFieldClassNames };

export type TextareaFieldProps = Omit<ComponentProps<'textarea'>, 'value'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Label for the textarea. */
  label?: undefined | React.ReactNode,

  /** Props for the `<label>` element, if `label` is defined. */
  labelProps?: undefined | ComponentProps<'label'>,
  
  /** Whether to display (Optional) next to the label. */
  optional?: undefined | boolean,

  /** Props for the wrapper element. */
  wrapperProps?: undefined | ComponentProps<'div'>,
  
  /** Text to be displayed under the textarea element. */
  hint?: undefined | string,
};

/**
 * Textarea field.
 */
export const TextareaField = (props: TextareaFieldProps) => {
  const {
    unstyled = false,
    label,
    labelProps = {},
    wrapperProps = {},
    optional = false,
    hint = '',
    ...textareaProps
  } = props;
  
  const controlId = React.useId();
  const formContext = useFormContext();
  
  return (
    <div
      {...wrapperProps}
      className={cx(
        'bk',
        { [cl['bk-textarea-field']]: !unstyled },
        wrapperProps.className,
      )}
    >
      {label && (
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-textarea-field__label'], labelProps.className)}
        >
          {label}
          {optional && (<span className={cl['bk-textarea-field__label__optional']}>(Optional)</span>)}
        </label>
      )}
      <Textarea
        {...textareaProps}
        id={controlId}
        form={formContext.formId}
        className={cx(cl['bk-textarea-field__control'], textareaProps.className)}
      />
      {hint && (
        <p className={cl['bk-textarea-field__hint']}>{hint}</p>
      )}
    </div>
  );
}
