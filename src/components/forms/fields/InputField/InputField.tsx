/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { Input } from '../../controls/Input/Input.tsx';
import { Tag } from '../../../text/Tag/Tag.tsx';

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

  /** Tags to be displayed inside the input field */
  tags?: undefined | string[],

  /** Callback to remove a specific Tag, passed down to Tag component. */
  tagRemoveCallback?: (index: number) => void,
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
    tags = [],
    tagRemoveCallback,
    ...inputProps
  } = props;

  const controlId = React.useId();
  const formContext = useFormContext();

  const injectedInputProps = {
    ...inputProps,
    unstyled: tags && tags.length > 0,
  };

  return (
    <div
      {...wrapperProps}
      className={cx(
        'bk',
        { [cl['bk-input-field']]: !unstyled },
        { [cl['bk-input-field--with-tags']]: tags && tags.length > 0 },
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
      <div className={cl['bk-input-field__tags-and-input']}>
        {tags && (
          tags.map((tag, idx) => <Tag key={idx} content={tag} onRemove={() => tagRemoveCallback?.(idx)}/>)
        )}
        <Input
          {...injectedInputProps}
          id={controlId}
          form={formContext.formId}
          className={cx(cl['bk-input-field__control'], inputProps.className)}
        />
      </div>
    </div>
  );
};
