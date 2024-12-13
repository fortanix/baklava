/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import { DatePicker } from '../DatePicker/DatePicker.tsx';
import { TimePicker, type Time } from '../TimePicker/TimePicker.tsx';

import cl from './DateTimePicker.module.scss';


type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: undefined | ClassNameArgument,
  
  /** A Date object to hold the date and time. */
  date: Date | null,
  
  /** A callback function that is called when either the date or the time picker is changed. */
  onChange: ((date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
};

export type DateTimePickerProps = GenericProps;

export const DateTimePicker = ({ unstyled = false, className, date, onChange, ...propsRest }: DateTimePickerProps) => {
  // Time from date object.
  const time = { hours: date?.getHours() || 0, minutes: date?.getMinutes() || 0 };
  
  // Manually update upstream Date object when time is updated.
  const onTimeUpdate = (time: Time) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(time.hours);
      newDate.setMinutes(time.minutes);
      onChange(newDate);
    }
  };

  return (
    <div className={cx(
      'bk',
      { [cl['bk-date-time-picker']]: !unstyled },
      className,
    )}>
      <DatePicker
        selected={date}
        onChange={onChange}
      />
      <TimePicker
        time={time}
        onUpdate={onTimeUpdate}
        className={cx(
          { [cl['bk-date-time-picker--time-picker']]: !unstyled },
        )}
      />
    </div>
  );
};
