/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './AppLayout.module.scss';


type AppLayoutProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;

/**
 * AppLayout component.
 */
export const AppLayout = (props: AppLayoutProps) => {
  const { unstyled = false, ...propsRest } = props;
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-app-layout']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
