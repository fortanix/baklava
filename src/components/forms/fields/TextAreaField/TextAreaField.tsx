/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { TextArea } from '../../controls/TextArea/TextArea.tsx';

import cl from './TextAreaField.module.scss';


export { cl as TextAreaFieldClassNames };

export type TextAreaFieldProps = Omit<ComponentProps<'textarea'>, 'value'> & {
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
 * TextArea field.
 */
export const TextAreaField = (props: TextAreaFieldProps) => {
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
        { [cl['bk-text-area-field']]: !unstyled },
        wrapperProps.className,
      )}
    >
      {label && (
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-text-area-field__label'], labelProps.className)}
        >
          {label}
          {optional && (<span className={cl['bk-text-area-field__label__optional']}>(Optional)</span>)}
        </label>
      )}
      <TextArea
        {...textareaProps}
        id={controlId}
        form={formContext.formId}
        className={cx(cl['bk-text-area-field__control'], textareaProps.className)}
      />
      {hint && (
        <p className={cl['bk-text-area-field__hint']}>{hint}</p>
      )}
    </div>
  );
};
