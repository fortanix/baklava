/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';

import { Input } from '../Input/Input.tsx';


// TODO: eventually move this to a separate file, as this tends to be repeated on every component?
type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: ClassNameArgument,
}

// copying props from react-datepicker and restricting them to specific versions
// TODO: I would like to reuse this from DatePicker.tsx, how can I reuse it from there without exporting it?
// Or maybe the solution is to define all variants from the same file?
type GenericReactDatePickerOmittedProps = Omit<ComponentProps<typeof ReactDatePicker>, 'selectsRange' | 'selectsMultiple' | 'onChange'>;

type ReactDatePickerRangeProps = GenericReactDatePickerOmittedProps & {
  // not including selectsRange because we will pass that manually to react-datepicker
  // selectsMultiple?: never,
  // TODO: it seems like react-datepicker has a bug? the onChange accepts always "Date | null" or variations -
  // in this case, an array of exactly two elements of Date | null)
  // but then the startDate and endDate parameters do NOT take null.
  // therefore I think it'd make sense to handle them as [Date, Date] and
  // somehow make it accept (as our more strict variant is within what they accept)
  onChange?: (date: [Date, Date], event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void,
};

export type DatePickerRangeProps = GenericProps & ReactDatePickerRangeProps;

export const DatePickerRange = (props: DatePickerRangeProps) => {
  // TODO how could I reuse DatePicker component only passing the props that I want? Something as simple as
  // <DatePicker selectsRange={true} {...propsRest} />
  
  const {
    unstyled = false,
    className,
    ...propsRest
  } = props;
  
  return (
    <div className={cx(
      'bk',
      { [cl['bk-datepicker']]: !unstyled },
      className,
    )}>
      <ReactDatePicker
        selectsRange={true}
        // everything else is the same
        className={cx(
          cl['bk-date-picker__date'],
        )}
        dateFormat="MM/dd/yyyy"
        placeholderText="MM/DD/YYYY"
        customInput={<Input />}
        {...propsRest}
      />
    </div>
  );
};
