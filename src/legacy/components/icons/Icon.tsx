/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/component_util.tsx';

import './Icon.scss';


export type SpriteIconProps = ComponentProps<'svg'> & {
  name: string,
  /** @deprecated */
  icon?: undefined | Promise<unknown>,
};
// Note: keep the `React.memo()` so that we don't rerender when the `icon` promise is updated
export const SpriteIcon = React.memo((props: SpriteIconProps) => {
  const {
    name,
    icon,
    ...propsRest
  } = props;
  
  const iconId = `baklava-icon-legacy-${name}`;
  
  return (
    <svg
      role="img"
      aria-label={name}
      data-icon-id={iconId}
      {...propsRest}
      className={cx('bkl bkl-icon', propsRest.className)}
    >
      <use href={`#${iconId}`} fill="currentColor"/>
    </svg>
  );
});
