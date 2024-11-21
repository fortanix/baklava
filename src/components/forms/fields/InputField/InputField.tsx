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

  /** Callback to update the input value. Internally hooks to onChange */
  onUpdate?: undefined | ((arg0: string) => void),

  /** Callback to update the tags. Internally hooks to onKeyUp */
  onUpdateTags?: undefined | ((arg0: string[]) => void),
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
    onUpdate = null,
    onUpdateTags = null,
    ...inputProps
  } = props;

  const controlId = React.useId();
  const formContext = useFormContext();

  const injectedInputProps = {
    ...inputProps,
    unstyled: tags && tags.length > 0,
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // first handle supplied onChange, if exists
    if (inputProps.onChange) {
      inputProps.onChange(e);
    }
    // then return value to onUpdate
    if (onUpdate) {
      onUpdate(e.target.value);
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // first handle supplied onKeyUp, if exists
    if (inputProps.onKeyUp) {
      inputProps.onKeyUp(e);
    }
    // then return value to onUpdateTags
    if (onUpdateTags && onUpdate) {
      const { value } = inputProps;
      if (e.key === 'Backspace' && value === '') {
        onUpdateTags(tags.slice(0,-1));
      }
      if (e.key === 'Enter' && value !== '') {
        onUpdateTags([...tags as string[], value as string]);
        onUpdate('');
      }
    }
  };

  const onRemoveTag = (index: number) => {
    if (onUpdateTags) {
      onUpdateTags(tags.filter((_, idx) => idx !== index));
    }
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
      <div className={cl['bk-input-field__container']}>
        {tags && (
          tags.map((tag, idx) => <Tag key={idx} content={tag} onRemove={() => onRemoveTag(idx)}/>)
        )}
        <Input
          {...injectedInputProps}
          id={controlId}
          form={formContext.formId}
          className={cx(cl['bk-input-field__control'], inputProps.className)}
          onChange={onChange}
          onKeyUp={onKeyUp}
        />
      </div>
    </div>
  );
};
