/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input } from '../Input/Input.tsx';

import cl from './TimePicker.module.scss';


export type Time = {
  hours: number,
  minutes: number,
};

export type TimePickerProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
  
  /** A time object with hours and minutes, as numbers. */
  time: null | Time,
  
  /** A callback function to update the time. */
  onUpdate: (time: null | Time) => void,
};

export const TimePicker = (props: TimePickerProps) => {
  const { unstyled = false, className, time, onUpdate, ...propsRest } = props;
  
  const timeString: string = time === null
    ? ''
    : `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = event.target.value;
    
    // Note: `newTimeString` may be empty (reproduce by hitting backspace while editing the time input)
    if (newTimeString.trim() === '') {
      onUpdate(null);
    } else {
      const [hours, minutes] = newTimeString.split(':');
      onUpdate({ hours: Number(hours), minutes: Number(minutes) });
    }
  };
  
  return (
    <div
      className={cx(
        'bk',
        { [cl['bk-time-picker']]: !unstyled },
        className,
      )
    }>
      <Input
        type="time"
        value={timeString}
        onChange={onChange}
        className={cx(
          { [cl['bk-time-picker--input']]: !unstyled },
        )}
        {...propsRest}
      />
    </div>
  );
};
