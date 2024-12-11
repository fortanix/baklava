/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import { DatePicker } from '../DatePicker/DatePicker.tsx';
import { TimePicker } from '../TimePicker/TimePicker.tsx';

import cl from './DateTimePicker.module.scss';


type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: undefined | ClassNameArgument,
  
  date: Date | null,
  
  onChange: ((date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
};

export type DateTimePickerProps = GenericProps;

export const DateTimePicker = ({ unstyled = false, className, date, onChange, ...propsRest }: DateTimePickerProps) => {
  // time string from date object
  const time = `${String(date?.getHours() || 0).padStart(2, '0')}:${String(date?.getMinutes() || 0).padStart(2, '0')}`;
  
  // update date object from time string
  const onTimeUpdate = (time: string) => {
    if (date) {
      const newDate = new Date(date);
      const [newHours, newMinutes] = time.split(':');
      if (newHours) {
        newDate.setHours(Number(newHours));
      }
      if (newMinutes) {
        newDate.setMinutes(Number(newMinutes));
      }
      onChange(newDate);
    }
  }

  return (
    <div className={cx(
      'bk',
      { [cl['bk-datetimepicker']]: !unstyled },
      className,
    )}>
      <DatePicker selected={date} onChange={onChange} />
      <TimePicker time={time} onUpdate={onTimeUpdate}/>
    </div>
  );
}
