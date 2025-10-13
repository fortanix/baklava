/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../../util/reactUtil.ts';
import { classNames as cx } from '../../../../../util/componentUtil.ts';
import { useFloatingElement } from '../../../../util/overlays/floating-ui/useFloatingElement.tsx';

import { Input } from '../../Input/Input.tsx';

import { DatePicker } from '../DatePicker/DatePicker.tsx';

import cl from './DateInput.module.scss';


export { cl as DateInputClassNames };

export type DateInputProps = Omit<React.ComponentProps<typeof Input>, 'value'> & {
  /** Props to be passed to the inner `DatePicker` component. */
  datePickerProps?: undefined | React.ComponentProps<typeof DatePicker>,
};
/**
 * A text input to enter a single date, or pick one from a date picker popup.
 */
export const DateInput = (props: DateInputProps) => {
  const {
    icon = 'calendar',
    iconLabel = 'Calendar',
    placeholder = 'MM/DD/YYYY',
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
  
  const anchorProps = {}; // TODO
  
  return (
    <>
      <Input
        {...mergeProps(
          {
            className: cx(
              'bk',
              cl['bk-date-input'],
              propsRest.className,
            ),
          },
        )}
        readOnly
        //value={formatDate(selected)}
        value="test"
        containerProps={anchorProps}
      />
      <DatePicker selected={new Date()} onChange={() => {}}/>
    </>
  );
};
