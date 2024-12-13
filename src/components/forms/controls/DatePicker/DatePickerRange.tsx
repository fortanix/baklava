/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';

import { Input } from '../Input/Input.tsx';


type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
};

type ReactDatePickerRangeProps = Omit<ComponentProps<typeof ReactDatePicker>, 'onChange'> & {
  // Note: need to disable the following features in order to use `ReactDatePicker` as a plain date picker.
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  onChange: ((date: [Date | null, Date | null], event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | undefined) => void),
};

export type DatePickerRangeProps = GenericProps & ReactDatePickerRangeProps;

export const DatePickerRange = (props: DatePickerRangeProps) => {
  const {
    unstyled = false,
    className,
    ...propsRest
  } = props;
  
  return (
    <div className={cx(
      'bk',
      { [cl['bk-date-picker']]: !unstyled },
      className,
    )}>
      <ReactDatePicker
        selectsRange
        // everything else is the same
        dateFormat="MM/dd/yyyy"
        placeholderText="MM/DD/YYYY"
        customInput={<Input />}
        {...propsRest}
      />
    </div>
  );
};
