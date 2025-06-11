/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './AppLayout.module.scss';


const AppLayoutHeader = (props: React.ComponentProps<'header'>) => {
  return <header slot="header" {...props} className={cx('bk-theme--dark', props.className)}/>;
};

const AppLayoutSidebar = (props: React.ComponentProps<'div'>) => {
  // Container around the sidebar that grows to full height, allowing the sidebar to be sticky
  return <div slot="sidebar" {...props} className={cx('bk-theme--dark', props.className)}/>;
};

const AppLayoutContent = (props: React.ComponentProps<'main'>) => {
  return <main slot="content" {...props} className={cx(props.className)}/>;
};

const AppLayoutFooter = (props: React.ComponentProps<'footer'>) => {
  return <footer slot="footer" {...props} className={cx(props.className)}/>;
};

type AppLayoutProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * AppLayout component.
 */
export const AppLayout = Object.assign(
  (props: AppLayoutProps) => {
    const { unstyled = false, ...propsRest } = props;
    return (
      <div
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-app-layout']]: !unstyled },
          propsRest.className,
        )}
      />
    );
  },
  {
    Header: AppLayoutHeader,
    Sidebar: AppLayoutSidebar,
    Content: AppLayoutContent,
    Footer: AppLayoutFooter,
  },
);
