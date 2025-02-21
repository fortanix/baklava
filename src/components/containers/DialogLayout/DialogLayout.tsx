/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './DialogLayout.module.scss';


export { cl as DialogLayoutClassNames };

export type DialogLayoutProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. Default: false. */
  unstyled?: undefined | boolean,

  /** Title for the layout, intended to be shown beneath the main Dialog title. */
  title?: undefined | React.ReactNode;

  /** Content to be displayed on the left of the dialog, as an aside */
  aside?: undefined | React.ReactNode;
};
export const DialogLayout = (props: DialogLayoutProps) => {
  const { unstyled, title, aside, children, ...propsRest } = props;
  return (
    <div
      className={cx(
        'bk',
        { [cl['bk-dialog-layout']]: !unstyled },
      )}
    >
      {title && <h3>{title}</h3>}
      <div className={cx(cl['bk-dialog-layout__content'])}>
        {aside && <aside className={cx(cl['bk-dialog-layout__content__aside'])}>{aside}</aside>}
        <section>{children}</section>
      </div>
    </div>
  );
};
