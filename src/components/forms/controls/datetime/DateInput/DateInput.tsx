/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { formatDate /*, parse as parseDate*/ } from 'date-fns';

import * as React from 'react';
import { mergeProps, mergeRefs } from '../../../../../util/reactUtil.ts';
import { classNames as cx } from '../../../../../util/componentUtil.ts';
import { useFloatingElement } from '../../../../util/overlays/floating-ui/useFloatingElement.tsx';

import { Input } from '../../Input/Input.tsx';
import { DatePicker } from '../DatePicker/DatePicker.tsx';

import cl from './DateInput.module.scss';


export { cl as DateInputClassNames };

export type DateInputValue = null | Date;

type DateInputInnerProps = React.ComponentProps<typeof Input> & {
  /**
   * The currently selected date. If `null`, the input will be empty. If `undefined`, this form control will be treated
   * as uncontrolled.
   */
  date?: undefined | DateInputValue,
  
  /** If uncontrolled, the default date value. */
  defaultDate?: undefined | DateInputValue,
  
  /** A callback that is called when the `date` is updated by the user. If uncontrolled, should be undefined. */
  onUpdateDate?: undefined | ((date: DateInputValue) => void),
  
  /** The date format to use for parsing/formatting the user input. Default: `'MM/dd/yyyy'` */
  dateFormat?: undefined | string,
};
/**
 * The inner date input, without the date picker popover.
 */
const DateInputInner = (props: DateInputInnerProps) => {
  const {
    date,
    defaultDate,
    onUpdateDate,
    dateFormat = 'MM/dd/yyyy',
    placeholder = 'MM/DD/YYYY', // Human-friendly equivalent of the default `dateFormat`
    icon = 'calendar',
    iconLabel = 'Date input',
    ...propsRest
  } = props;
  
  // Format the `date` as a string
  // Note: we need to support both controlled (`date` is defined) and uncontrolled (`date` is undefined)
  const dateString: undefined | string = date === undefined ? undefined
    : (date === null ? '' : formatDate(date, dateFormat));
  const defaultDateString: undefined | string = defaultDate === undefined ? undefined
    : (defaultDate === null ? '' : formatDate(defaultDate, dateFormat));
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onUpdateDate === 'undefined') {
      // Should not happen: `handleChange` should not be passed to the input when uncontrolled
      console.error(`Unexpected: onUpdateDate is undefined on controlled DateInput`);
      return;
    }
    
    const dateValue: string = event.target.value.trim();
    
    // TODO: allow editing the input
    /*
    if (dateValue === '') {
      onUpdateDate(null);
    } else {
      const timeParsed: DateInputValue = parseDate(dateValue, dateFormat);
      onUpdateDate(timeParsed);
    }
    */
  };
  
  return (
    <Input
      type="text"
      {...propsRest}
      className={cx(
        cl['bk-date-input__inner'],
        propsRest.className,
      )}
      readOnly // TODO: allow the user to enter a date through text input in addition to through the calendar picker
      value={dateString}
      defaultValue={typeof dateString === 'undefined' ? defaultDateString : undefined}
      onChange={handleChange}
      placeholder={placeholder}
      icon={icon}
      iconLabel={iconLabel}
    />
  );
};


type DatePickerProps = React.ComponentProps<typeof DatePicker>;

export type DateInputProps = React.ComponentProps<typeof DateInputInner> & {
  /** Props to be passed to the inner `DatePicker` component. */
  datePickerProps?: undefined | Omit<DatePickerProps, 'selected' | 'onChange'>,
};
/**
 * A text input to enter a date, or pick one from a date picker popover.
 */
export const DateInput = Object.assign(
  (props: DateInputProps) => {
    const {
      date,
      onUpdateDate,
      datePickerProps,
      ...propsRest
    } = props;
    
    const inputRef = React.useRef<React.ComponentRef<typeof DateInputInner>>(null);
    
    const {
      isOpen,
      setIsOpen,
      isMounted,
      refs,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
    } = useFloatingElement({
      triggerAction: 'focus-interactive',
      placement: 'bottom',
      offset: 4,
      role: 'combobox',
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none', // Do not flip to the left/right
      },
    });
    
    
    const anchorProps = mergeProps(
      getReferenceProps(propsRest.containerProps),
      { ref: mergeRefs(propsRest.containerProps?.ref, refs.setReference) },
    );
    
    const handleChange = React.useCallback((date: DateInputValue) => {
      onUpdateDate?.(date);
      //setIsOpen(false); // Doesn't really make sense, since focusing the input will just re-open it
      inputRef.current?.focus();
    }, [onUpdateDate]);
    
    return (
      <>
        <DateInputInner
          {...propsRest}
          ref={mergeRefs(inputRef, propsRest.ref)}
          className={cx(
            cl['bk-date-input'],
            propsRest.className,
          )}
          date={date}
          onUpdateDate={onUpdateDate}
          // Note: needs to be on `inputProps` because the `ref` must be the inner input, since
          // `togglePopover({ source })` requires a focusable element for popover tab order to work.
          // FIXME: the bounding box calculate will be off here for anchor positioning
          inputProps={anchorProps} // FIXME: merge with the rest of the props?
        />
        
        {isOpen &&
          <div
            // FIXME: props merger
            {...getFloatingProps({
              style: floatingStyles,
              popover: 'manual',
            })}
            ref={mergeRefs<HTMLDivElement>(refs.setFloating)}
          >
            <DatePicker
              {...datePickerProps}
              selected={date ?? null}
              onChange={handleChange}
            />
          </div>
        }
      </>
    );
  },
  {
    Action: Input.Action,
  },
);
