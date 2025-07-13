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
    active,
    scrollable,
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bkl',
        'bkl-backdrop',
        propsRest.className,
        {
          'bkl-backdrop--active': active,
          'bkl-backdrop--scrollable': scrollable,
        },
      )}
    />
  );
};
