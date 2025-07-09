/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

import './Backdrop.scss';

export type BackdropProps = JSX.IntrinsicElements['div'] & {
  active: boolean,
  scrollable?: boolean,
};

const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>((props, ref) => {
  const {
    children,
    className,
    active,
    onClick,
    onMouseDown,
    scrollable,
    onKeyDown,
  } = props;

  return (
    <div
      role="button"
      ref={ref}
      className={cx('bkl-backdrop', className, {
        'bkl-backdrop--active': active,
        'bkl-backdrop--scrollable': scrollable,
      })}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
});

Backdrop.displayName = 'Backdrop';

export default Backdrop;
