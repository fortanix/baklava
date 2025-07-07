/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';

import './Headings.scss';


type H1Props = ComponentProps<'h1'>;
export const H1 = ({ children, className, ...props }: H1Props) => (
  <h1 className={cx('bkl', 'bkl-heading heading-1', className)} {...props}>
    {children}
  </h1>
);

type H2Props = ComponentProps<'h2'>;
export const H2 = ({ children, className, ...props }: H2Props) => (
  <h2 className={cx('bkl', 'bkl-heading heading-2', className)} {...props}>
    {children}
  </h2>
);

type H3Props = ComponentProps<'h3'>;
export const H3 = ({ children, className, ...props }: H3Props) => (
  <h3 className={cx('bkl', 'bkl-heading heading-3', className)} {...props}>
    {children}
  </h3>
);

type H4Props = ComponentProps<'h4'>;
export const H4 = ({ children, className, ...props }: H4Props) => (
  <h4 className={cx('bkl', 'bkl-heading heading-4', className)} {...props}>
    {children}
  </h4>
);

type H5Props = ComponentProps<'h5'>;
export const H5 = ({ children, className, ...props }: H5Props) => (
  <h5 className={cx('bkl', 'bkl-heading heading-5', className)} {...props}>
    {children}
  </h5>
);

type H6Props = ComponentProps<'h6'>;
export const H6 = ({ children, className, ...props }: H6Props) => (
  <h6 className={cx('bkl', 'bkl-heading heading-6', className)} {...props}>
    {children}
  </h6>
);
