/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Breadcrumbs.module.scss';
import { Link } from '../../../components/actions/Link/Link.tsx';


export { cl as BreadcrumbsClassNames };

export type BreadcrumbItem = ComponentProps<'li'> & {
  title: string,
  href: string,
};
export type BreadcrumbsProps = React.PropsWithChildren<ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The routing informations */
  items: Array<BreadcrumbItem>,
  
  /** Whether the last breadcrumb item has slash or not. */
  hasTrailingSlash?: boolean,
}>;
/**
 * A breadcrumbs component
 */
export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { children, unstyled = false, items = [], hasTrailingSlash, ...propsRest } = props;
  return (
    <nav
      {...propsRest}
      aria-label="Breadcrumbs"
      className={cx(
        'bk',
        { [cl['bk-breadcrumbs']]: !unstyled },
        propsRest.className,
      )}
    >
      <ol className={cx([cl['bk-breadcrumb']])}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: No other unique key available
              key={index}
              className={cx({
                [cl['bk-breadcrumb-item']]: true,
                [cl['bk-breadcrumb-item--with-trailing-slash']]: hasTrailingSlash,
              }, item.className)}
            >
              {item.href && !isLast
                ? <Link href={item.href} className={cx([cl['bk-breadcrumb-link']])}>{item.title}</Link>
                : item.title
              }
            </li>
          );
        })}
        {children}
      </ol>
    </nav>
  );
};
