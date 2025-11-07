/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../../util/componentUtil.ts';

import { Input } from '../../Input/Input.tsx';

import cl from './TimeInput.module.scss';


export type Time = {
  hours: number,
  minutes: number,
};
const formatTime = (time: Time) => {
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
};
const parseTime = (time: string): null | Time => {
  const [hoursString, minutesString] = time.trim().split(':');
  if (typeof hoursString !== 'string' || typeof minutesString !== 'string') {
    console.warn(`Invalid time string: ${time}`)
    return null;
  }
  
  const hours = Number(hoursString);
  const minutes = Number(minutesString);
  if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
    console.warn(`Invalid time string: ${time}`)
    return null;
  }
  
  return { hours, minutes };
};

export type TimeInputProps = Omit<ComponentProps<'input'>, 'time' | 'onUpdate'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The time value, specified as an object with the hours and minutes. If `null`, the time input will be empty. */
  time: null | Time,
  
  /** A callback function that is called when the time is updated by the user. */
  onUpdate: (time: null | Time) => void,
};
export const TimeInput = (props: TimeInputProps) => {
  const { unstyled = false, time, onUpdate, ...propsRest } = props;
  
  // Format the time as a string
  const timeString: string = time === null ? '' : formatTime(time);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = event.target.value.trim();
    
    // Note: `newTimeString` may be empty (can reproduce by hitting backspace while editing the time input)
    if (newTimeString === '') {
      onUpdate(null);
    } else {
      const timeParsed: null | Time = parseTime(newTimeString);
      onUpdate(timeParsed);
    }
  };
  
  return (
    <div
      className={cx(
        'bk',
        { [cl['bk-time-input']]: !unstyled },
        propsRest.className,
      )
    }>
      <Input
        type="time"
        value={timeString}
        onChange={onChange}
        className={cx(
          { [cl['bk-time-input--input']]: !unstyled },
        )}
        {...propsRest}
      />
    </div>
  );
};
