/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ComponentPropsWithoutRef, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';


export type DatePickerProps = Omit<ComponentPropsWithoutRef<typeof ReactDatePicker>, 'onChange'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  className?: ClassNameArgument,

  date: Date,
  maxDate?: Date,
  minDate?: Date,
  onChange: (date: Date) => void,
};

/** A wrapper for ReactDatePicker */
export const DatePicker = (props: DatePickerProps) => {
  const {
    unstyled = false,
    className,
    date,
    maxDate,
    minDate,
    onChange,
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
        maxDate={maxDate}
        minDate={minDate}
        placeholderText="MM/DD/YYYY"
        selected={date}
        onChange={onChange}
        {...propsRest}
      />
    </div>
  );
};
