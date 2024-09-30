/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './FormLayout.module.scss';


export { cl as FormLayoutClassNames };

export type FormLayoutProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Standard vertical form layout.
 */
export const FormLayout = (props: FormLayoutProps) => {
  const { unstyled = false, ...propsRest } = props;
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-form-layout']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
