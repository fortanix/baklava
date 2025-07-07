
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';
import * as React from 'react';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon';
import ReactDatePicker from 'react-datepicker';


type DatePickerProps = Omit<ComponentPropsWithoutRef<typeof ReactDatePicker>, 'onChange'> & {
  date: Date,
  maxDate?: Date,
  minDate?: Date,
  onChange: (date: Date) => void,
};
export const DatePicker = (props: DatePickerProps) => {
  const { className, date, maxDate, minDate, onChange, ...propsRest } = props;
  
  return (
    <div className="bkl-date-picker bkl-input">
      <BaklavaIcon icon="calendar" className="bkl-input--calendar__icon"/>
      <ReactDatePicker
        className={cx('bkl-input__input bkl-date-picker__date', className)}
        dateFormat="MM/dd/yyyy"
        maxDate={maxDate}
        minDate={minDate}
        placeholderText="MM/DD/YYYY"
        selected={date}
        onChange={onChange}
        {...propsRest}
      />
    </div>
  );
};
