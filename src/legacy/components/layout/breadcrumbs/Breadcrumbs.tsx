/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import './Breadcrumbs.scss';


type BreadcrumbItemProps = ComponentProps<'li'>;
const BreadcrumbsItem = (props: BreadcrumbItemProps) => {
  const { className, children, ...propsRest } = props;
  return (
    <li
      {...propsRest}
      className={cx('bkl-breadcrumbs-item', className)}
    >
      {children}
    </li>
  );
};

type BreadcrumbsProps = ComponentProps<'ol'> & {
  children: React.ReactNode,
  noTrailingSlash?: undefined | boolean,
};
export const Breadcrumbs = Object.assign(
  (props: BreadcrumbsProps) => {
    const {
      children,
      className,
      noTrailingSlash = false,
      ...propsRest
    } = props;
    
    return (
      <ol
        {...propsRest}
        aria-label="Breadcrumbs"
        className={cx('bkl bkl-breadcrumbs', className, { 'bkl-breadcrumbs--no-trailing-slash': noTrailingSlash })}
      >
        {children}
      </ol>
    );
  },
  {
    Item: BreadcrumbsItem,
  },
);
