/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';

import './Caption.scss';


type CaptionProps = ComponentProps<'span'> & {
  size?: undefined | 'normal' | 'small',
};
export const Caption = ({ children, className, size = 'normal', ...props }: CaptionProps) => (
  <span className={cx('bkl', 'caption', { 'caption--small': size === 'small' }, className)} {...props}>
    {children}
  </span>
);
