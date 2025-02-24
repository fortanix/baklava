/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Label } from '../../common/Label/Label.tsx';
import { Checkbox } from '../Checkbox/Checkbox.tsx';

import cl from './Switch.module.scss';


export { cl as SwitchClassNames };

export type SwitchProps = ComponentProps<typeof Checkbox> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};

export type SwitchLabeledProps = SwitchProps & {
  label: React.ComponentProps<typeof Label>['label'],
  labelProps?: undefined | React.ComponentProps<typeof Label>,
};
export const SwitchLabeled = ({ label, labelProps, ...props }: SwitchLabeledProps) =>
  <Label position="inline-end" label={label} {...labelProps}><Switch {...props}/></Label>;

/**
 * Switch control.
 */
export const Switch = Object.assign(
  (props: SwitchProps) => {
    const {
      unstyled = false,
      ...propsRest
    } = props;
    
    const isInteractive = !propsRest.disabled;
    
    return (
      <Checkbox
        //switch // https://webkit.org/blog/15054/an-html-switch-control
        unstyled
        {...propsRest}
        disabled={!isInteractive}
        className={cx(
          { [cl['bk-switch']]: !unstyled },
          propsRest.className,
        )}
      />
    );
  },
  {
    Labeled: SwitchLabeled,
  },
);
