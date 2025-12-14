/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../../../util/componentUtil.ts';

import ReactDatePicker from 'react-datepicker';

import cl from './DatePicker.module.scss';


type ReactDatePickerIrrelevant = (
  | 'date' // This is in the type, but doesn't seem to actually do anything (use `selected` instead)
  // Not relevant for `inline` (non-exhaustive):
  | 'placeholderText'
  | 'showIcon'
  | 'icon'
  | 'toggleCalendarOnIconClick'
  // Omit the `holidays` prop to prevent a `TS4082` error at declaration generation time because `react-datepicker`
  // does not export the `Holiday` type
  | 'holidays'
);

/**
 * @see https://github.com/Hacker0x01/react-datepicker/blob/main/docs/datepicker.md
 */
// Omit `date` (which is misleadingly in the `ReactDatePicker` props type, but doesn't actually do anything)
type DatePickerProps = Omit<React.ComponentProps<typeof ReactDatePicker>, ReactDatePickerIrrelevant | 'onChange'> & {
  className?: undefined | ClassNameArgument,
  
  // Narrow the type down to just a single-date date picker
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  onChange: ((date: null | Date, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
  selected: null | Date,
};

/**
 * A form control to select a single date through a calendar view.
 */
export const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    ...propsRest
  } = props;
  
  return (
    <ReactDatePicker
      inline
      dateFormat={dateFormat}
      {...propsRest}
      //className // Note: `className` does nothing in `inline` mode, use `calendarClassName` instead
      calendarClassName={cx('bk', cl['bk-date-picker'], className)}
      selected={props.selected}
      onChange={props.onChange}
    />
  );
};
