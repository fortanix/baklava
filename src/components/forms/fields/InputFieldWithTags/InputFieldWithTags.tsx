/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { Input } from '../../controls/Input/Input.tsx';
import { Tag } from '../../../text/Tag/Tag.tsx';

import cl from './InputFieldWithTags.module.scss';


export { cl as InputFieldWithTagsClassNames };

export type InputFieldWithTagsProps = Omit<ComponentProps<'input'>, 'value'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Label for the input. */
  label?: undefined | React.ReactNode,

  /** Props for the `<label>` element, if `label` is defined. */
  labelProps?: undefined | ComponentProps<'label'>,

  /** Props for the wrapper element. */
  wrapperProps?: undefined | ComponentProps<'div'>,

  /** Value of the input field */
  value?: undefined | string,

  /** Tags to be displayed inside the input field */
  tags?: undefined | string[],

  /** Callback to update the input value. Internally hooks to onChange */
  onUpdate?: undefined | ((value: string) => void),

  /** Callback to update the tags. Internally hooks to onKeyDown */
  onUpdateTags?: undefined | ((tags: string[]) => void),
};
/**
 * Input field with tags. Enter creates a new tag, backspace erases last tag.
 */
export const InputFieldWithTags = (props: InputFieldWithTagsProps) => {
  const {
    unstyled = false,
    label,
    labelProps = {},
    wrapperProps = {},
    value = '',
    tags = [],
    onUpdate,
    onUpdateTags,
    ...inputProps
  } = props;

  const controlId = React.useId();
  const formContext = useFormContext();

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // first handle supplied onKeyDown, if exists
    if (inputProps.onKeyDown) {
      inputProps.onKeyDown(e);
    }
    // then return value to onUpdateTags
    if (onUpdateTags && onUpdate) {
      if (e.key === 'Backspace' && value === '') {
        onUpdateTags(tags.slice(0,-1));
      }
      if (e.key === 'Enter' && value !== '') {
        onUpdateTags([...tags, value.trim()]);
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
        { [cl['bk-input-field-with-tags']]: !unstyled },
        wrapperProps.className,
      )}
    >
      {label &&
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-input-field-with-tags__label'], labelProps.className)}
        >
          {label}
        </label>
      }
      <div className={cl['bk-input-field-with-tags__container']}>
        {tags && (
          // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
          tags.map((tag, idx) => <Tag key={idx} content={tag} onRemove={() => onRemoveTag(idx)}/>)
        )}
        <div className={cl['bk-input-field-with-tags__input-container']}>
          <Input
            {...inputProps}
            unstyled={true}
            id={controlId}
            form={formContext.formId}
            className={cx(cl['bk-input-field-with-tags__control'], inputProps.className)}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value}
          />
        </div>
      </div>
    </div>
  );
};
