/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { format as dateFnsFormat/*, parse as dateFnsParse*/ } from 'date-fns';

import * as React from 'react';
import { mergeCallbacks, mergeProps, mergeRefs } from '../../../../../util/reactUtil.ts';
import { classNames as cx } from '../../../../../util/componentUtil.ts';
import { useFloatingElement } from '../../../../util/overlays/floating-ui/useFloatingElement.tsx';

import { Input } from '../../Input/Input.tsx';
import { DatePicker } from '../DatePicker/DatePicker.tsx';

import cl from './DateInput.module.scss';


export { cl as DateInputClassNames };

export type DateInputValue = Date;

const dateFormatDefault = 'MM/dd/yyyy';

const formatDate = (date: DateInputValue, dateFormat: string): string => {
  return dateFnsFormat(date, dateFormat);
};

type DateInputInnerProps = React.ComponentProps<typeof Input> & {
  /**
   * The currently selected date. If `null`, the input will be empty. If `undefined`, this form control will be treated
   * as uncontrolled.
   */
  date?: undefined | null | DateInputValue,
  
  /** If uncontrolled, the default date value. */
  defaultDate?: undefined | null | DateInputValue,
  
  /** A callback that is called when the `date` is updated by the user. If uncontrolled, should be undefined. */
  onUpdateDate?: undefined | ((date: null | DateInputValue) => void),
  
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
    dateFormat = dateFormatDefault,
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
      automaticResize
      placeholder={placeholder}
      icon={icon}
      iconLabel={iconLabel}
      {...propsRest}
      className={cx(
        cl['bk-date-input__inner'],
        propsRest.className,
      )}
      readOnly // TODO: allow the user to enter a date through text input in addition to through the calendar picker
      value={dateString}
      defaultValue={typeof dateString === 'undefined' ? defaultDateString : undefined}
      onChange={mergeCallbacks([handleChange, propsRest.onChange])}
    />
  );
};


type DatePickerProps = React.ComponentProps<typeof DatePicker>;

export type DateInputProps = React.ComponentProps<typeof DateInputInner> & {
  /** Props to be passed to the inner `DatePicker` component. */
  datePickerProps?: undefined | Omit<DatePickerProps, 'selected' | 'onChange' | 'dateFormat'>,
  
  /** The date format to use for parsing/formatting the user input. Default: `'MM/dd/yyyy'` */
  dateFormat?: undefined | string,
};
/**
 * A text input to enter a date, or pick one from a date picker popover.
 */
export const DateInput = Object.assign(
  (props: DateInputProps) => {
    const {
      date,
      defaultDate,
      onUpdateDate,
      datePickerProps,
      dateFormat = dateFormatDefault,
      ...propsRest
    } = props;
    
    const [uncontrolledDate, setUncontrolledDate] = React.useState<null | DateInputValue>(defaultDate ?? null);
    
    if (typeof onUpdateDate !== 'undefined' && typeof date === 'undefined') {
      console.warn('Missing onUpdateDate in DateInput that is used as an uncontrolled component');
    }
    if (typeof onUpdateDate === 'undefined' && typeof date !== 'undefined') {
      console.warn('Missing date in DateInput that is used as an uncontrolled component');
    }
    
    const dateSelected: null | DateInputValue = typeof onUpdateDate === 'function'
      ? (date ?? null) // Controlled case
      : uncontrolledDate; // Uncontrolled case
    
    const inputRef = React.useRef<React.ComponentRef<typeof DateInputInner>>(null);
    
    const {
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
    
    
    const anchorProps: React.ComponentProps<'input'> = mergeProps(
      getReferenceProps(propsRest.inputProps),
      { ref: mergeRefs<HTMLInputElement>(propsRest.inputProps?.ref, refs.setReference) },
    );
    
    const floatingProps = mergeProps(
      getFloatingProps({
        style: floatingStyles,
        popover: 'manual',
      }),
      { ref: refs.setFloating },
    );
    
    const handleChange = (date: null | DateInputValue) => {
      if (typeof onUpdateDate === 'function') { // Controlled case
        onUpdateDate(date);
      } else {
        setUncontrolledDate(date);
      }
      
      //setIsOpen(false); // Doesn't really make sense, since focusing the input will just re-open it
      inputRef.current?.focus();
    };
    
    return (
      <>
        <DateInputInner
          {...propsRest}
          ref={mergeRefs(inputRef, propsRest.ref)}
          className={cx(
            cl['bk-date-input'],
            propsRest.className,
          )}
          date={dateSelected}
          defaultDate={defaultDate}
          onUpdateDate={onUpdateDate}
          // Note: needs to be on `inputProps` because the `ref` must be the inner input, since
          // `togglePopover({ source })` requires a focusable element for popover tab order to work.
          // FIXME: the bounding box calculation will be off here for anchor positioning, ideally it would be on the
          // container (but the container is not focusable). Maybe: override `getBoundingClientRect`?
          inputProps={anchorProps}
        />
        
        {isMounted &&
          <div
            {...floatingProps}
            className={cx(cl['bk-date-input__picker'])}
          >
            <DatePicker
              {...datePickerProps}
              selected={dateSelected}
              onChange={handleChange}
            />
          </div>
        }
      </>
    );
  },
  {
    formatDate,
    //parseDate,
    Action: Input.Action,
  },
);
