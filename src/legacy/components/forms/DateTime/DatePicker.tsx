/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '../Input/Input.scss';
import './DateTimePicker.scss';


type DatePickerProps = Omit<ComponentProps<typeof ReactDatePicker>, 'onChange'> & {
  // Note: need to disable the following features in order to use `ReactDatePicker` as a plain date picker.
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  
  date: null | Date,
  maxDate?: undefined | Date,
  minDate?: undefined | Date,
  onChange: ((date: null | Date, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
};
export const DatePicker = (props: DatePickerProps) => {
  const { date, maxDate, minDate, onChange = () => {}, ...propsRest } = props;
  
  return (
    <div className="bkl bkl-date-picker bkl-input">
      <BaklavaIcon icon="calendar" className="bkl-input--calendar__icon"/>
      <ReactDatePicker
        dateFormat="MM/dd/yyyy"
        {...minDate ? { minDate } : {}} // Workaround for `exactOptionalPropertyTypes`
        {...maxDate ? { maxDate } : {}} // Workaround for `exactOptionalPropertyTypes`
        placeholderText="MM/DD/YYYY"
        selected={date}
        onChange={onChange}
        {...propsRest}
        // Need to cast this to `string` because `ReactDatePicker` doesn't play well with `exactOptionalPropertyTypes`
        className={cx('bkl-input__input bkl-date-picker__date', propsRest.className) as string}
      />
    </div>
  );
};
