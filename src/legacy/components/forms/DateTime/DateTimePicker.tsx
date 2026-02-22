/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { format, getYear, getMonth, getDate, set, addHours, subHours } from 'date-fns';

import * as React from 'react';
import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';

import { Input } from '../Input/Input.tsx';
import { Select } from '../Select/Select.tsx';
import { DatePicker } from './DatePicker.tsx';
import ReactDatePicker from 'react-datepicker';

import cl from './DateTimePicker.module.scss';


// Time

type Time = { hours: number, minutes: number }; // 00:00 through 23:59

const formatTime = (time: Time) =>
  `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;

type TimeFromDateTimeParams = { system: '12-hour' | '24-hour' };
const timeFromDateTime = (dateTime: Date, { system = '24-hour' }: Partial<TimeFromDateTimeParams> = {}): Time => {
  return {
    hours: parseInt(format(dateTime, system === '12-hour' ? 'hh' : 'HH'), 10),
    minutes: parseInt(format(dateTime, 'mm'), 10),
  };
};

type TimeInputProps = {
  time: Time,
  updateTime: (time: Time) => void,
};
const TimeInput = ({ time, updateTime }: TimeInputProps) => {
  const [timeBuffer, setTimeBuffer] = React.useState<string>(() => formatTime(time));
  
  // Parse a string of the form `hh:mm` (24-hour) to a `Time` instance, or `null` if invalid
  const parseTimeBuffer = React.useCallback((buffer: string): null | Time => {
    const bufferTrimmed = buffer.trim();
    
    if (!/\d{1,2}:\d{2}/.test(bufferTrimmed)) { return null; }
    
    const [hours, minutes] = bufferTrimmed.split(':').map(Number);
    if (typeof hours === 'undefined' || typeof minutes === 'undefined') { return null; } // Should not happen
    
    if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) { return null; }
    
    return { hours, minutes };
  }, []);
  
  const update = React.useCallback(() => {
    const timeResult: null | Time = parseTimeBuffer(timeBuffer);
    
    if (timeResult === null) {
      // If invalid, do not update, revert to previous valid state
      setTimeBuffer(formatTime(time));
      return;
    }
    
    updateTime(timeResult);
  }, [time, timeBuffer, updateTime, parseTimeBuffer]);
  
  React.useEffect(() => {
    // Update the buffer when we get a new time value
    setTimeBuffer(formatTime(time));
  }, [time]);
  
  return (
    <Input
      type="text"
      className={cx(cl['bkl-date-time-picker__time'])}
      placeholder="hh:mm"
      value={timeBuffer}
      onChange={evt => {
        setTimeBuffer(evt.target.value);
      }}
      onBlur={update}
    />
  );
};


// Meridiem

type Meridiem = 'am' | 'pm';

const getMeridiem = (dateTime: Date): Meridiem => {
  return format(dateTime, 'aaa') as Meridiem;
};

// Take a `Date` object, and update its meridiem
const updateMeridiemInDateTime = (dateTime: Date, meridiemUpdated: Meridiem) => {
  // Note: need to be careful to not change the date here
  const meridiem = getMeridiem(dateTime);
  const isUpdated = meridiemUpdated !== meridiem;
  if (isUpdated) {
    if (meridiem === 'am') {
      return addHours(dateTime, 12);
    } else {
      return subHours(dateTime, 12);
    }
  } else {
    return dateTime;
  }
};

type MeridiemPickerProps = {
  meridiem: Meridiem,
  updateMeridiem: (meridiem: Meridiem) => void,
  dropdownReference?: undefined | React.RefObject<HTMLUListElement>,
};
const MeridiemPicker = ({ meridiem, updateMeridiem, dropdownReference }: MeridiemPickerProps) => {
  const meridiemOptions = React.useMemo(() => ({
    am: { label: 'AM' },
    pm: { label: 'PM' },
  }), []);
  
  return (
    <Select
      className={cx(cl['bkl-date-time-picker__meridiem'])}
      options={meridiemOptions}
      value={meridiem}
      dropdownReference={dropdownReference}
      // Need the cast because `Select` isn't generic over `options`
      onSelect={updateMeridiem as (meridiem: string) => void}
    />
  );
};


type DateTimePickerProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  dateTime: Date,
  maxDate?: undefined | Date,
  minDate?: undefined | Date,
  onChange: (dateTime: null | Date) => void,
  dropdownReference?: undefined | React.RefObject<HTMLUListElement>,
  datePickerProps?: undefined | Partial<React.ComponentProps<typeof ReactDatePicker>> & {
    // Note: need to disable the following features in order to use `ReactDatePicker` as a plain date picker.
    selectsRange?: never,
    selectsMultiple?: never,
    showMonthYearDropdown?: never,
  },
};
export const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    dateTime,
    onChange,
    maxDate,
    minDate,
    datePickerProps = {},
    dropdownReference,
    ...propsRest
  } = props;
  
  const updateDateTime = (dateTime: null | Date) => {
    // Make sure seconds/miliseconds are set to zero
    const dateTimeUpdated = dateTime === null ? null : set(dateTime, { seconds: 0, milliseconds: 0 });
    
    onChange(dateTimeUpdated);
  };
  
  const updateDate = (dateUpdated: null | Date) => {
    const dateTimeUpdated = dateUpdated === null ? null : set(dateTime, {
      year: getYear(dateUpdated),
      month: getMonth(dateUpdated),
      date: getDate(dateUpdated),
    });
    updateDateTime(dateTimeUpdated);
  };
  
  const updateTime = (time: Time) => {
    const meridiem = getMeridiem(dateTime);
    const dateTimeUpdated = set(dateTime, {
      // Note: `set` expects 24-hour time values, so convert our 12-hour `time.hours` to 24-hours if meridiem is `pm`
      hours: meridiem === 'pm' && time.hours < 12 ? time.hours + 12 : time.hours,
      minutes: time.minutes,
    });
    
    updateDateTime(dateTimeUpdated);
  };
  
  const updateMeridiem = (meridiem: Meridiem) => {
    updateDateTime(updateMeridiemInDateTime(dateTime, meridiem));
  };
  
  return (
    <div {...propsRest} className={cx('bkl', cl['bkl-date-time-picker'], propsRest.className)}>
      <DatePicker
        {...datePickerProps}
        date={dateTime}
        onChange={updateDate}
        {...minDate ? { minDate } : {}} // Workaround for `exactOptionalPropertyTypes`
        {...maxDate ? { maxDate } : {}} // Workaround for `exactOptionalPropertyTypes`
      />
      <TimeInput
        time={timeFromDateTime(dateTime, { system: '12-hour' })}
        updateTime={updateTime}
      />
      <MeridiemPicker
        meridiem={getMeridiem(dateTime)}
        updateMeridiem={updateMeridiem}
        dropdownReference={dropdownReference}
      />
    </div>
  );
};
