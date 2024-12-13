/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';

import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Input } from '../Input/Input.tsx';

import 'react-datepicker/dist/react-datepicker.css';
import cl from './DatePicker.module.scss';


type GenericProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** An optional class name to be appended to the class list. */
  className?: undefined | ClassNameArgument,
};

type ReactDatePickerProps = Omit<ComponentProps<typeof ReactDatePicker>, 'onChange'> & {
  // Note: need to disable the following features in order to use `ReactDatePicker` as a plain date picker.
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  onChange: ((date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
};

export type DatePickerProps = GenericProps & ReactDatePickerProps;

export const DatePicker = (props: DatePickerProps) => {
  const {
    unstyled = false,
    className,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    ...propsRest
  } = props;

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <div className={cx(
      'bk',
      { [cl['bk-date-picker']]: !unstyled },
      className,
    )}>
      <ReactDatePicker
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        showIcon
        icon={<Icon icon="calendar"/>}
        customInput={
          <Input className={cx(
            { [cl['bk-date-picker--input']]: !unstyled },
          )}/>
        }
        onCalendarClose={() => setIsOpen(false)}
        onCalendarOpen={() => setIsOpen(true)}
        {...propsRest}
      />
      <Icon icon={`caret-${isOpen ? 'up' : 'down'}`} className={cx(cl['bk-date-picker--caret'])}/>
    </div>
  );
};
