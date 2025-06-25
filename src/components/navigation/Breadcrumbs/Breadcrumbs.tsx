/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks } from '../../../util/reactUtil.ts';

import { Link as LinkDefault } from '../../../components/actions/Link/Link.tsx';

import cl from './Breadcrumbs.module.scss';


export { cl as BreadcrumbsClassNames };

/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb
*/


type BreadcrumbItemLinkProps = Pick<
  React.ComponentProps<typeof LinkDefault>,
  'children' | 'unstyled' | 'tabIndex' | 'aria-disabled' | 'href' | 'className' | 'onClick'
>;

type BreadcrumbItemProps<LinkProps extends BreadcrumbItemLinkProps> = ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A custom `Link` component. Optional. */
  Link?: undefined | React.ComponentType<LinkProps>,
  
  /** Additional props to pass to the `Link` component. */
  linkProps?: undefined | LinkProps,
  
  /** The target of the breadcrumb item link. */
  href?: undefined | string,
  
  /** The breadcrumb item link label. */
  label?: undefined | string,
  
  /** Whether this breadcrumb item is the currently active one. Default: false. */
  active?: undefined | boolean,
  
  /** Whether this breadcrumb item should be disabled. Default: false. */
  disabled?: undefined | boolean,
};
export const BreadcrumbItem = <LinkProps extends BreadcrumbItemLinkProps>(props: BreadcrumbItemProps<LinkProps>) => {
  const {
    children,
    unstyled,
    className,
    Link = LinkDefault,
    linkProps = {} as LinkProps,
    href,
    label,
    active = false,
    disabled = false,
    ...propsRest
  } = props;
  
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [disabled]);
  
  const renderItem = () => {
    if (active) {
      return label;
    }
    
    if (label) {
      return (
        <Link
          tabIndex={disabled ? -1 : undefined}
          aria-disabled={disabled}
          href={href}
          {...linkProps}
          className={cx(
            cl['bk-breadcrumb__item__link'],
            { [cl['bk-breadcrumb__item__link--disabled']]: disabled },
            linkProps.className,
          )}
          onClick={mergeCallbacks([handleClick, disabled ? undefined : linkProps.onClick])}
        >
          {label}
        </Link>
      );
    }
    return children;
  };
  
  return (
    <li
      aria-current={active ? 'page' : undefined}
      {...propsRest}
      className={cx(
        { [cl['bk-breadcrumb__item']]: !unstyled },
        className,
      )}
    >
      {renderItem()}
    </li>
  );
};


type BreadcrumbsProps = React.PropsWithChildren<ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;

/**
 * Breadcrumbs component, displaying an ordered set of links forming the path of the current location of the user.
 */
export const Breadcrumbs = Object.assign(
  (props: BreadcrumbsProps) => {
    const { children, unstyled = false, ...propsRest } = props;
    
    return (
      <nav
        aria-label="Breadcrumbs"
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-breadcrumbs']]: !unstyled },
          propsRest.className,
        )}
      >
        <ol>
          {children}
        </ol>
      </nav>
    );
  },
  {
    Item: BreadcrumbItem,
  },
);
