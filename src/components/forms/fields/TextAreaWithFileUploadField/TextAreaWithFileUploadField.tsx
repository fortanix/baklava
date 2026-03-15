/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { TextAreaWithFileUpload } from '../../controls/TextAreaWithFileUpload/TextAreaWithFileUpload.tsx';

import cl from './TextAreaWithFileUploadField.module.scss';


export { cl as TextAreaWithFileUploadFieldClassNames };

export type TextAreaWithFileUploadFieldProps = ComponentProps<'textarea'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Label for the textarea. */
  label?: undefined | React.ReactNode,

  /** Props for the `<label>` element, if `label` is defined. */
  labelProps?: undefined | ComponentProps<'label'>,

  /** Whether to display (Optional) next to the label. */
  optional?: undefined | boolean,

  /** Props for the container element. */
  containerProps?: undefined | ComponentProps<'div'>,

  /** Text to be displayed under the textarea element. */
  hint?: undefined | string,

};

/**
 * TextArea field.
 */
export const TextAreaWithFileUploadField = (props: TextAreaWithFileUploadFieldProps) => {
  const {
    unstyled = false,
    label,
    labelProps = {},
    containerProps = {},
    optional = false,
    hint = '',
    ...textareaProps
  } = props;

  const controlId = React.useId();
  const formContext = useFormContext();

  return (
    <div
      {...containerProps}
      className={cx(
        'bk',
        { [cl['bk-text-area-file-upload-field']]: !unstyled },
        containerProps.className,
      )}
    >

      {label && (
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-text-area-file-upload-field__label'], labelProps.className)}
        >
          {label}
          {optional && (<span className={cl['bk-text-area-file-upload-field__label__optional']}>(Optional)</span>)}
        </label>
      )}
      <TextAreaWithFileUpload
        {...textareaProps}
        id={controlId}
        form={formContext.formId}
        className={cx(
          cl['bk-text-area-file-upload-field__control'],
          textareaProps.className
        )}
      />

      {hint && (
        <p className={cl['bk-text-area-file-upload-field__hint']}>{hint}</p>
      )}
    </div>
  );
};
