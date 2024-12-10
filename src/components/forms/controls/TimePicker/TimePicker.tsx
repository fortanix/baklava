/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input } from '../Input/Input.tsx';

import cl from './TimePicker.module.scss';


export type TimePickerProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
  
  /** The date object to show / manipulate the time. */
  date: Date,
  
  /** A callback function to update the time. */
  onUpdate: (date: Date) => void,
};

export const TimePicker = ({ unstyled = false, className, date, onUpdate, ...propsRest }: TimePickerProps) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = e.target.value;
    const [newHours, newMinutes] = newTimeString.split(':');
    let newDate = new Date(date);
    newDate.setHours(Number(newHours));
    newDate.setMinutes(Number(newMinutes));
    onUpdate(newDate);
  };
  
  return (
    <div className={cx(
      'bk',
      { [cl['bk-timepicker']]: !unstyled },
      className,
    )}>
      <Input type="time" value={time} onChange={onChange} {...propsRest} />
    </div>
  );
};