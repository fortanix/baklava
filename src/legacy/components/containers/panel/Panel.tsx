/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

import { useScroller } from '../../layout/util/Scroller';

import './Panel.scss';


export type PanelProps = Omit<JSX.IntrinsicElements['div'], 'className'> & {
  children: React.ReactNode,
  className?: string,
  secondary?: boolean,
  flat?: boolean,
};
export const Panel = ({ children, className = '', secondary = false, flat = false, ...props }: PanelProps) => {
  const scrollerProps = useScroller();
  return (
    <div
      {...props}
      className={cx(
        'bkl-panel',
        { 'bkl-panel--secondary': secondary },
        { 'bkl-panel--with-depth': !flat },
        scrollerProps.className,
        className,
      )}
    >
      {children}
    </div>
  );
};
Panel.displayName = 'Panel';
