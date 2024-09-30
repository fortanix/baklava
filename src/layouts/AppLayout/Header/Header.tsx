/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Header.module.scss';


export type HeaderProps = React.PropsWithChildren<ComponentProps<'header'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Header component (for app layout).
 */
export const Header = ({ children, unstyled, ...propsRest }: HeaderProps) => {
  return (
    <header
      role="banner"
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-app-layout-header']]: !unstyled },
      )}
    >
      {children}
    </header>
  );
};
