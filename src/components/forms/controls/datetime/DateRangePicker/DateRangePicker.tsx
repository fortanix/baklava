/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../../../util/componentUtil.ts';

import ReactDatePicker from 'react-datepicker';

import cl from './DateRangePicker.module.scss';


// Note: omit the `holidays` prop to prevent a `TS4082` error at declaration generation time because `react-datepicker`
// does not export the `Holiday` type
type ReactDatePickerProps = Omit<React.ComponentProps<typeof ReactDatePicker>, 'holidays'>;

type ReactDatePickerIrrelevant = (
  | 'date' // This is in the type, but doesn't seem to actually do anything (use `selected` instead)
  // Not relevant for `inline` (non-exhaustive):
  | 'placeholderText'
  | 'showIcon'
  | 'icon'
  | 'toggleCalendarOnIconClick' 
);

// Note: each end (or both) may be `null` while the user is editing
export type DateRange = [null | Date, null | Date];

/**
 * @see https://github.com/Hacker0x01/react-dateRangepicker/blob/main/docs/dateRangepicker.md
 */
// Omit `date` (which is misleadingly in the `ReactDatePicker` props type, but doesn't actually do anything)
type DateRangePickerProps = Omit<ReactDatePickerProps, ReactDatePickerIrrelevant | 'selected' | 'onChange'> & {
  className?: undefined | ClassNameArgument,
  
  // Customize `selected` and `onChange` to use `DateRange`
  selected?: DateRange,
  onChange: (date: DateRange, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void,
  
  // Disallow the `startDate` and `endDate` props (we combine these into `selected` instead)
  
  // Narrow the type down to be suitable for a date range picker
  selectsRange?: true,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
};

/**
 * A form control to select a single date through a calendar view.
 */
export const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    selected,
    onChange,
    ...propsRest
  } = props;
  
  const [startDate, endDate] = selected ?? [null, null];
  
  return (
    <ReactDatePicker
      inline
      selectsRange
      dateFormat={dateFormat}
      {...propsRest}
      //className // Note: `className` does nothing in `inline` mode, use `calendarClassName` instead
      calendarClassName={cx('bk', cl['bk-date-range-picker'], className)}
      selected={null} // Not used with `selectsRange`, set `startDate` and `endDate` instead
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
    />
  );
};
