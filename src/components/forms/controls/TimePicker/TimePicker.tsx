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
  
  /** A time string as defined to be used by input type="time", with the hh:mm format. */
  time: string,
  
  /** A callback function to update the time. */
  onUpdate: (time: string) => void,
};

export const TimePicker = ({ unstyled = false, className, time, onUpdate, ...propsRest }: TimePickerProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = e.target.value;
    onUpdate(newTimeString);
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
