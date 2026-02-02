/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';

import { H3, H5 } from '../../typography/Heading/Heading.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';

import cl from './PageLayout.module.scss';


const PageLayoutHeading = (props: React.ComponentProps<'span'>) => (
  <H3 className={cx(cl['bk-page-layout__header__heading'], props.className)}>{props.children}</H3>
);

const PageLayoutSubHeading = (props: React.ComponentProps<'span'>) => (
  <H5 className={cx(cl['bk-page-layout__header__heading'], props.className)}>{props.children}</H5>
);

const PageLayoutNav = (props: React.ComponentProps<'div'>) => (
  <div {...props} className={cx(cl['bk-page-layout__nav'], props.className)}/>
);

const PageLayoutScopeSwitcher = (props: React.ComponentProps<'div'>) => (
  <div {...props} className={cx(cl['bk-page-layout__header__scope-switcher'], props.className)}/>
);

type PageHeaderProps = React.PropsWithChildren<Omit<ComponentProps<'header'>, 'title'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A page title to be displayed. You can pass a single string with &lt;PageLayout.Heading&gt;, or a custom component with &lt;PageLayout.ScopeSwitcher&gt; */
  title: React.ReactNode,
}>;
/**
 * A page header with a title and action buttons
 */
const PageHeader = (props: PageHeaderProps) => {
  const { unstyled = false, title, children, ...propsRest } = props;
  
  return (
    <header
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-page-layout__header']]: !unstyled },
        propsRest.className,
      )}
    >
      {title}
      {children && (
        <div className={cl['bk-page-layout__header__actions']}>{children}</div>
      )}
    </header>
  );
};

type PageLayoutProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * PageLayout component.
 */
export const PageLayout = Object.assign(
  (props: PageLayoutProps) => {
    const { unstyled = false, ...propsRest } = props;
    return (
      <div
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-page-layout']]: !unstyled },
          propsRest.className,
        )}
      />
    );
  },
  {
    Body: Panel,
    Header: PageHeader,
    Heading: PageLayoutHeading,
    SubHeading: PageLayoutSubHeading,
    Nav: PageLayoutNav,
    ScopeSwitcher: PageLayoutScopeSwitcher,
  },
);
