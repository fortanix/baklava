/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Heading.module.scss';


export type H1Props = React.PropsWithChildren<ComponentProps<'h1'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H1 = ({ unstyled, ...props }: H1Props) => (
  <h1 {...props} className={cx('bk', { [cl['bk-h1']]: !unstyled }, props.className)}/>
);

export type H2Props = React.PropsWithChildren<ComponentProps<'h2'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H2 = ({ unstyled, ...props }: H2Props) => (
  <h2 {...props} className={cx('bk', { [cl['bk-h2']]: !unstyled }, props.className)}/>
);

export type H3Props = React.PropsWithChildren<ComponentProps<'h3'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H3 = ({ unstyled, ...props }: H3Props) => (
  <h3 {...props} className={cx('bk', { [cl['bk-h3']]: !unstyled }, props.className)}/>
);

export type H4Props = React.PropsWithChildren<ComponentProps<'h4'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H4 = ({ unstyled, ...props }: H4Props) => (
  <h4 {...props} className={cx('bk', { [cl['bk-h4']]: !unstyled }, props.className)}/>
);

export type H5Props = React.PropsWithChildren<ComponentProps<'h5'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H5 = ({ unstyled, ...props }: H5Props) => (
  <h5 {...props} className={cx('bk', { [cl['bk-h5']]: !unstyled }, props.className)}/>
);

export type H6Props = React.PropsWithChildren<ComponentProps<'h6'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const H6 = ({ unstyled, ...props }: H6Props) => (
  <h6 {...props} className={cx('bk', { [cl['bk-h6']]: !unstyled }, props.className)}/>
);
