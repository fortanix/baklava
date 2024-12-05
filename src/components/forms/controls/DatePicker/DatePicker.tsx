/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ComponentPropsWithoutRef, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';


// Omit<ComponentPropsWithoutRef<typeof ReactDatePicker>, 'onChange'> & {
export type DatePickerProps = typeof ReactDatePicker & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
};

/** A wrapper for ReactDatePicker */
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
        {...propsRest}
      />
    </div>
  );
};
