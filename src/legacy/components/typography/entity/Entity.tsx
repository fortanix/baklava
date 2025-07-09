/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util.tsx';

import './Entity.scss';


type EntityProps = ComponentPropsWithoutRef<'span'> & {
  size?: undefined | 'normal' | 'small',
};
export const Entity = ({ children, className, size = 'normal', ...props }: EntityProps) => (
  <span className={cx('bkl', 'entity', { 'entity--small': size === 'small' }, className)} {...props}>
    {children}
  </span>
);
