/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/component_util.tsx';

import './Backdrop.scss';

export type BackdropProps = ComponentProps<'div'> & {
  active: boolean,
  scrollable?: undefined | boolean,
};
export const Backdrop = (props: BackdropProps) => {
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
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop click is a visual-only affordance
    <div
      className={cx(
        'bkl',
        'bkl-backdrop',
        className,
        {
          'bkl-backdrop--active': active,
          'bkl-backdrop--scrollable': scrollable,
        },
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};
