/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../../util/componentUtil.ts';

import { Input } from '../../Input/Input.tsx';

import cl from './TimeInput.module.scss';


export type TimeInputValue = {
  hours: number,
  minutes: number,
};
const formatTime = (time: TimeInputValue) => {
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
};
const parseTime = (time: string): null | TimeInputValue => {
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

export type TimeInputProps = Omit<ComponentProps<typeof Input>, 'time' | 'onUpdate'> & {
  /**
   * The time value, specified as an object with the hours and minutes. If `null`, the time input will be empty.
   * If `undefined`, this form control will be treated as uncontrolled.
   */
  time?: undefined | null | TimeInputValue,
  
  /** If uncontrolled, the default time value. */
  defaultTime?: undefined | null | TimeInputValue,
  
  /** A callback that is called when the time is updated by the user. If uncontrolled, should be undefined. */
  onUpdateTime?: undefined | ((time: null | TimeInputValue) => void),
};
export const TimeInput = Object.assign(
  (props: TimeInputProps) => {
    const { time, defaultTime, onUpdateTime, ...propsRest } = props;
    
    // Format the `time` as a string
    // Note: we need to support both controlled (`time` is defined) and uncontrolled (`time` is undefined)
    const timeString: undefined | string = time === undefined ? undefined
      : (time === null ? '' : formatTime(time));
    const defaultTimeString: undefined | string = defaultTime === undefined ? undefined
      : (defaultTime === null ? '' : formatTime(defaultTime));
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onUpdateTime === 'undefined') {
        // Should not happen: `handleChange` should not be passed to the input when uncontrolled
        console.error(`Unexpected: onUpdateTime is undefined on controlled TimeInput`);
        return;
      }
      
      // Most modern browsers will produce a valid time string (`hh:mm`), or an empty string.
      // Empty string will be produced either if the input is invalid, or if the user clears the input (e.g. backspace).
      const timeValue: string = event.target.value.trim();
      
      if (timeValue === '') {
        onUpdateTime(null);
      } else {
        const timeParsed: null | TimeInputValue = parseTime(timeValue);
        onUpdateTime(timeParsed);
      }
    };
    
    return (
      <Input
        type="time"
        {...propsRest}
        value={timeString}
        defaultValue={typeof timeString === 'undefined' ? defaultTimeString : undefined}
        onChange={typeof timeString === 'undefined' ? undefined : handleChange}
        className={cx(
          cl['bk-time-input'],
          propsRest.className,
        )}
      />
    );
  },
  {
    formatTime,
    parseTime,
  },
);
