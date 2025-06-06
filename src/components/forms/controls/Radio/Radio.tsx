/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { Label } from '../../common/Label/Label.tsx';

import cl from './Radio.module.scss';


export { cl as RadioClassNames };

export type RadioProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};

export type RadioLabeledProps = RadioProps & {
  label: React.ComponentProps<typeof Label>['label'],
  labelProps?: undefined | Partial<React.ComponentProps<typeof Label>>,
};
export const RadioLabeled = ({ label, labelProps = {}, ...props }: RadioLabeledProps) => {
  const isDisabled = props.disabled;
  return (
    <Label position="inline-end" label={label} {...labelProps}
      className={cx(
        cl['bk-radio-labeled'],
        { [cl['bk-radio-labeled--disabled']]: isDisabled },
        labelProps.className,
      )}
    >
      <Radio {...props}/>
    </Label>
  );
};

/**
 * A single radio button. Can be selected, but not deselected unless it's part of a (mutually exclusive) radio group.
 */
export const Radio = Object.assign(
  (props: RadioProps) => {
    const { unstyled = false, ...propsRest } = props;
    
    return (
      <input
        type="radio"
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-radio']]: !unstyled },
          propsRest.className,
        )}
      />
    );
  },
  {
    Labeled: RadioLabeled,
  },
);
