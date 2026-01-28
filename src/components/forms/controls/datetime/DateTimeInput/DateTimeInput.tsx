/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../../util/componentUtil.ts';

import { type DateInputValue, DateInput } from '../DateInput/DateInput.tsx';
import { type TimeInputValue, TimeInput } from '../TimeInput/TimeInput.tsx';

import cl from './DateTimeInput.module.scss';


export { cl as DateTimeInputClassNames };

export type DateTimeInputProps = ComponentProps<'div'> & {
  dateTime?: undefined | null | Date,
  defaultDateTime?: undefined | Date,
  onUpdateDateTime?: undefined | ((dateTime: null | Date) => void),
  
  dateInputProps?: undefined | React.ComponentProps<typeof DateInput>,
  timeInputProps?: undefined | React.ComponentProps<typeof TimeInput>,
};
/**
 * A form control that allows the user to input a date + time.
 */
export const DateTimeInput = (props: DateTimeInputProps) => {
  const {
    dateTime = null,
    defaultDateTime,
    onUpdateDateTime,
    dateInputProps,
    timeInputProps,
    ...propsRest
  } = props;
  
  // TODO: allow uncontrolled use of this component + form usage
  
  // Time from `Date` object
  const timeInputValue: null | TimeInputValue = dateTime instanceof Date
    ? { hours: dateTime.getHours(), minutes: dateTime.getMinutes() }
    : null;
  
  const handleUpdateDate = (dateInput: null | DateInputValue) => {
    if (dateInput === null) {
      onUpdateDateTime?.(null);
      return;
    }
    
    const dateTimeUpdated = new Date(dateInput.valueOf());
    dateTimeUpdated.setHours(dateTime?.getHours() ?? 0);
    dateTimeUpdated.setMinutes(dateTime?.getMinutes() ?? 0);
    onUpdateDateTime?.(dateTimeUpdated);
  };
  
  const handleUpdateTime = (timeInput: null | TimeInputValue) => {
    const dateTimeUpdated = new Date(dateTime ?? Date.now());
    dateTimeUpdated.setHours(timeInput?.hours ?? 0);
    dateTimeUpdated.setMinutes(timeInput?.minutes ?? 0);
    onUpdateDateTime?.(dateTimeUpdated);
  };
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-date-time-input'],
        propsRest.className,
      )}
    >
      <DateInput
        {...dateInputProps}
        date={dateTime} // The time part of the date will be ignored by the component
        onUpdateDate={handleUpdateDate}
      />
      <TimeInput
        {...timeInputProps}
        time={timeInputValue}
        onUpdateTime={handleUpdateTime}
      />
    </div>
  );
};
