/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './Code.scss';


type CodeProps = ComponentPropsWithoutRef<'span'>;
export const Code = ({ children, className, ...props }: CodeProps) => (
  <span className={cx('code', className)} {...props}>
    {children}
  </span>
);
