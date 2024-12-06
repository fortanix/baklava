/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';

import { Input } from '../Input/Input.tsx';


// TODO: eventually move this to a separate file, as this tends to be repeated on every component?
type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
}

// copying props from react-datepicker and restricting them to specific versions
// TODO: I would like to reuse this on DatePickerRange.tsx, how can I reuse it there without exporting it?
type GenericReactDatePickerOmittedProps = Omit<ComponentProps<typeof ReactDatePicker>, 'selectsRange' | 'selectsMultiple' | 'onChange'>;

type ReactDatePickerProps = GenericReactDatePickerOmittedProps & {
  // TODO: considering we omitted them, do we still need to include it's properties as "never" (as defined on original library),
  // or in this case is it redundant?
  // selectsRange?: never,
  // selectsMultiple?: never,
  onChange?: (date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void,
};

export type DatePickerProps = GenericProps & ReactDatePickerProps;

export const DatePicker = (props: DatePickerProps) => {
  const {
    unstyled = false,
    className,
    ...propsRest
  } = props;

  return (
    <div className={cx(
      'bk',
      { [cl['bk-datepicker']]: !unstyled },
      className,
    )}>
      <ReactDatePicker
        className={cx(
          cl['bk-date-picker__date'],
        )}
        dateFormat="MM/dd/yyyy"
        placeholderText="MM/DD/YYYY"
        customInput={<Input />}
        {...propsRest}
      />
    </div>
  );
};
