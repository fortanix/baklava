/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { DatePicker } from '../DatePicker/DatePicker.tsx';
import { TimePicker, type Time } from '../TimePicker/TimePicker.tsx';

import cl from './DateTimePicker.module.scss';


export type DateTimePickerProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  /** A Date object to hold the date and time. */
  date: null | Date,
  
  /** The minimum date that can be selected. Optional. */
  minDate: null | Date,
  
  /** The maximum date that can be selected. Optional. */
  maxDate: null | Date,
  
  /** A callback function that is called when either the date or the time picker is changed. */
  onChange: ((date: null | Date, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
  
  /** A string for the date format, such as MM/dd/yyyy. */
  dateFormat?: undefined | string,
  
  /** A string for the placeholder text, such as MM/DD/YYYY. */
  placeholderText?: undefined | string,
};
/**
 * Date + time picker form control.
 */
export const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    date,
    onChange,
    minDate,
    maxDate,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    ...propsRest
  } = props;
  
  // Time from `Date` object
  const time = { hours: date?.getHours() || 0, minutes: date?.getMinutes() || 0 };
  
  // Manually update upstream `Date` object when time is updated
  const onTimeUpdate = (time: Time) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(time.hours);
      newDate.setMinutes(time.minutes);
      onChange(newDate);
    }
  };
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-date-time-picker'],
        propsRest.className,
      )}
    >
      <DatePicker
        selected={date}
        onChange={onChange}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        {...(minDate ? { minDate: new Date(minDate) } : {})}
        {...(maxDate ? { maxDate: new Date(maxDate) } : {})}
      />
      <TimePicker
        time={time}
        onUpdate={onTimeUpdate}
        className={cx(cl['bk-date-time-picker--time-picker'])}
      />
    </div>
  );
};
