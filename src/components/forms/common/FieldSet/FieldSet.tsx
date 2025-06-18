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
  
  /** The orientation of the radio buttons, either vertical or horizontal. Default: `"vertical"`. */
  orientation?: undefined | 'horizontal' | 'vertical',
}>;
/**
 * A group of form controls or fields.
 */
export const FieldSet = (props: FieldSetProps) => {
  const {
    children,
    unstyled = false,
    contentClassName,
    legend,
    orientation = 'vertical',
    ...propsRest
  } = props;
  
  const renderContent = () => {
    if (orientation === 'horizontal') {
      return (
        <div> {/* Row */}
          {legend && <legend>{legend}</legend>}
          
          <div> {/* Cell */}
            <div className={cx(cl['bk-field-set__content'], contentClassName)}>
              {children}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <>
          {legend && <legend>{legend}</legend>}
          
          <div className={cx(cl['bk-field-set__content'], contentClassName)}>
            {children}
          </div>
        </>
      )
    }
  };
  
  return (
    <fieldset
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-field-set']]: !unstyled },
        { [cl['bk-field-set--vertical']]: orientation === 'vertical' },
        { [cl['bk-field-set--horizontal']]: orientation === 'horizontal' },
        propsRest.className,
      )}
    >
      {renderContent()}
    </fieldset>
  );
};
