/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './FieldLayout.module.scss';


export { cl as FieldLayoutClassNames };

export type FieldLayoutProps = React.PropsWithChildren<{
  size: 'small' | 'medium',
}>;

/**
 * Field layout wrapper, to make inputs with smaller widths.
 */
export const FieldLayout = (props: FieldLayoutProps) => {
  const { children, size } = props;

  return (
    <div className={cx(
      'bk',
      cl['bk-field-layout'],
      cl[`bk-field-layout--${size}`],
    )}>
      {children}
    </div>
  );
};

