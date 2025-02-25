/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ComponentProps } from '../../util/componentUtil.ts';

import cl from './Heading.module.scss';


type HeadingProps = {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};

export type H1Props = ComponentProps<'h1'> & HeadingProps;
export const H1 = ({ unstyled, ...props }: H1Props) => (
  <h1 {...props} className={cx('bk', { [cl['bk-h1']]: !unstyled }, props.className)}/>
);

export type H2Props = ComponentProps<'h2'> & HeadingProps;
export const H2 = ({ unstyled, ...props }: H2Props) => (
  <h2 {...props} className={cx('bk', { [cl['bk-h2']]: !unstyled }, props.className)}/>
);

export type H3Props = ComponentProps<'h3'> & HeadingProps;
export const H3 = ({ unstyled, ...props }: H3Props) => (
  <h3 {...props} className={cx('bk', { [cl['bk-h3']]: !unstyled }, props.className)}/>
);

export type H4Props = ComponentProps<'h4'> & HeadingProps;
export const H4 = ({ unstyled, ...props }: H4Props) => (
  <h4 {...props} className={cx('bk', { [cl['bk-h4']]: !unstyled }, props.className)}/>
);

export type H5Props = ComponentProps<'h5'> & HeadingProps;
export const H5 = ({ unstyled, ...props }: H5Props) => (
  <h5 {...props} className={cx('bk', { [cl['bk-h5']]: !unstyled }, props.className)}/>
);

export type H6Props = ComponentProps<'h6'> & HeadingProps;
export const H6 = ({ unstyled, ...props }: H6Props) => (
  <h6 {...props} className={cx('bk', { [cl['bk-h6']]: !unstyled }, props.className)}/>
);
