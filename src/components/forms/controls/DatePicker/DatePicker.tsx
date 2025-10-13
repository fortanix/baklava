/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Input } from '../Input/Input.tsx';

import ReactDatePicker from 'react-datepicker';

import cl from './DatePicker.module.scss';


/**
 * @see https://github.com/Hacker0x01/react-datepicker/blob/main/docs/datepicker.md
 */
// Omit `date` (which is misleadingly in the `ReactDatePicker` props type, but doesn't actually do anything)
type DatePickerProps = Omit<React.ComponentProps<typeof ReactDatePicker>, 'date' | 'onChange'> & {
  className?: undefined | ClassNameArgument,
  
  // Narrow the type down to just a single-date date picker
  selectsRange?: never,
  selectsMultiple?: never,
  showMonthYearDropdown?: never,
  onChange: ((date: null | Date, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void),
  selected: null | Date,
};

/**
 * A calendar control: displays a calendar and allows the user to select a single date.
 */
export const Calendar = (props: DatePickerProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    ...propsRest
  } = props;
  
  return (
    <ReactDatePicker
      inline
      dateFormat={dateFormat}
      {...propsRest}
      selected={props.selected}
      onChange={props.onChange}
    />
  );
};

/**
 * Date picker form control.
 */
export const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    ...propsRest
  } = props;
  
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  
  return (
    <div
      className={cx(
        'bk',
        cl['bk-date-picker'],
        className,
      )}
    >
      <ReactDatePicker
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        showIcon
        icon={<Icon icon="calendar"/>}
        customInput={
          <Input className={cx([cl['bk-date-picker__input']])}/>
        }
        onCalendarClose={() => { setIsOpen(false); }}
        onCalendarOpen={() => { setIsOpen(true); }}
        {...propsRest}
        selected={props.selected}
        onChange={props.onChange}
      />
      <Icon
        className={cx(
          cl['bk-date-picker__caret'],
          { [cl['bk-date-picker__caret--down']]: !isOpen },
        )}
        icon={`caret-${isOpen ? 'up' : 'down'}`}
      />
    </div>
  );
};




import { useFloatingElement } from '../../../util/overlays/floating-ui/useFloatingElement.tsx';

export type DatePickerInputProps = DatePickerProps & {
  /** Whether to show a calendar icon in the input field. */
  icon?: undefined | null | 'calendar',
  
  /** Props to be passed to the Input component. */
  inputProps?: undefined | React.ComponentProps<typeof Input>,
};

/**
 * Date picker input component that opens an inline date picker in a popover when focused.
 */
export const DatePickerInput = (props: DatePickerInputProps) => {
  const {
    className,
    dateFormat = 'MM/dd/yyyy',
    placeholderText = 'MM/DD/YYYY',
    icon = 'calendar',
    inputProps = {},
    selected,
    onChange,
    ...propsRest
  } = props;
  
  const {
    isOpen,
    setIsOpen,
    isMounted,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  } = useFloatingElement({
    triggerAction: 'focus',
    placement: 'bottom',
    offset: 4,
    role: 'dialog',
  });
  
  const closePicker = React.useCallback(() => { setIsOpen(false); }, [setIsOpen]);
  
  // Format the selected date for display in the input
  const formatDate = (date: null | Date): string => {
    if (!date) return '';
    
    // Use the same formatting logic as ReactDatePicker
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    if (dateFormat === 'MM/dd/yyyy') {
      return formatter.format(date);
    }
    
    // For other formats, fall back to basic formatting
    return date.toLocaleDateString('en-US');
  };
  
  const handleChange: DatePickerProps['onChange'] = React.useCallback((date, event) => {
    onChange(date, event);
    
    if (date instanceof Date) {
      closePicker();
    }
  }, [onChange]);
  
  const anchorProps = {
    ref: refs.setReference,
    ...getReferenceProps(),
  };
  
  return (
    <>
      <Input
        value={formatDate(selected)}
        placeholder={placeholderText}
        readOnly
        icon={icon ?? undefined}
        iconLabel="Calendar"
        {...mergeProps(
          {
            className: cx(
              'bk',
              cl['bk-date-picker-input'],
              className,
            ),
          },
          inputProps,
        )}
        containerProps={anchorProps}
      />
      
      {isOpen &&
        <div
          {...getFloatingProps()}
          ref={refs.setFloating}
          style={floatingStyles}
          className={cx('bk', cl['bk-date-picker-input-popover'])}
        >
          <DatePickerInline
            {...propsRest}
            selected={selected}
            onChange={handleChange}
            dateFormat={dateFormat}
            onClickOutside={closePicker}
          />
        </div>
      }
    </>
  );
};
