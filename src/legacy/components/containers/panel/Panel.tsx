/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import './Panel.scss';


export type PanelProps = ComponentProps<'div'> & {
  secondary?: undefined | boolean,
  flat?: undefined | boolean,
};
export const Panel = (props: PanelProps) => {
  const { secondary = false, flat = false, ...propsRest } = props;
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bkl',
        'bkl-panel',
        { 'bkl-panel--secondary': secondary },
        { 'bkl-panel--with-depth': !flat },
        propsRest.className,
      )}
    />
  );
};
