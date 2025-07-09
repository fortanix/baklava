/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import cx from 'classnames';
import * as React from 'react';

import './Breadcrumbs.scss';

export type BreadcrumbItemProps = Omit<JSX.IntrinsicElements['li'], 'className'> & {
  children: React.ReactNode,
  className?: string,
};

const BreadcrumbsItem = (props: BreadcrumbItemProps): React.ReactElement => {
  const { className = '', children, ...restProps } = props;
  return (
    <li
      {...restProps}
      className={cx('bkl-breadcrumbs-item', className)}
    >
      {children}
    </li>
  );
};

export type BreadcrumbProps = Omit<JSX.IntrinsicElements['ol'], 'className'> & {
  children: React.ReactNode,
  className?: string,
  noTrailingSlash?: boolean,
};
export const Breadcrumbs = (props: BreadcrumbProps): React.ReactElement => {
  const {
    children,
    className = '',
    noTrailingSlash = false,
    ...restProps
  } = props;
  
  return (
    <ol
      {...restProps}
      aria-label="Breadcrumbs"
      className={cx('bkl-breadcrumbs', className, { 'bkl-breadcrumbs--no-trailing-slash': noTrailingSlash })}
    >
      {children}
    </ol>
  );
};

Breadcrumbs.Item = BreadcrumbsItem;

export default Breadcrumbs;
