/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import ReactDatePicker from 'react-datepicker';

import { Input } from '../Input/Input.tsx';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePickerRange.module.scss';


export type DatePickerRangeProps = Omit<ComponentProps<typeof ReactDatePicker>, 'onChange'> & {
  // Note: need to disable the following features in order to use `ReactDatePicker` as a plain date picker.
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  onChange: (
    date: [null | Date, null | Date],
    event?: undefined | React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void,
};
/**
 * Similar to `DatePicker`, but allows selecting a range (start and end).
 */
export const DatePickerRange = (props: DatePickerRangeProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    ...propsRest
  } = props;
  
  return (
    <div
      className={cx(
        'bk',
        cl['bk-date-picker-range'],
        className,
      )}
    >
      <ReactDatePicker
        selectsRange
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        customInput={<Input className={cl['bk-date-picker-range--input']}/>}
        {...propsRest}
        onChange={props.onChange}
      />
    </div>
  );
};
