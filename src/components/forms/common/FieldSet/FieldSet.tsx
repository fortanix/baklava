/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import cl from './FieldSet.module.scss';


export { cl as FieldSetClassNames };

export type FieldSetProps = React.PropsWithChildren<ComponentProps<'fieldset'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Class name to apply to the inner content. */
  contentClassName?: undefined | ClassNameArgument,
  
  /** A human-readable name for this field set. */
  legend?: undefined | React.ReactNode,
}>;
/**
 * A group of form controls or fields.
 */
export const FieldSet = (props: FieldSetProps) => {
  const { unstyled = false, contentClassName, legend, children, ...propsRest } = props;
  return (
    <fieldset
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-field-set']]: !unstyled },
        propsRest.className,
      )}
    >
      {legend && <legend>{legend}</legend>}
      
      <div className={cx(cl['bk-field-set__content'], contentClassName)}>
        {children}
      </div>
    </fieldset>
  );
};
