/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';

import { H3, H6 } from '../../typography/Heading/Heading.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { TextLine } from '../../components/text/TextLine/TextLine.tsx';

import cl from './PageLayout.module.scss';


type PageHeaderProps = React.PropsWithChildren<ComponentProps<'header'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A page title to be displayed. */
  title?: undefined | string,
  
  /** A select to be displayed instead of a title. */
  titleSelect?: undefined | React.ReactNode;
}>;
/**
 * A page header with a title and action buttons
 */
const PageHeader = (props: PageHeaderProps) => {
  const { unstyled = false, title, titleSelect, children, ...propsRest } = props;
  
  return (
    <header
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-page-layout__header']]: !unstyled },
        propsRest.className,
      )}
    >
      {title && (
        <H3 className={cl['bk-page-layout__header__h3']}>
          <TextLine>{title}</TextLine>
        </H3>
      )}
      {titleSelect && (
        <H6 className={cl['bk-page-header__select']}>{titleSelect}</H6>
      )}
      {children && (
        <div className={cl['bk-page-layout__header__actions']}>
          {children}
        </div>
      )}
    </header>
  );
};

const PageLayoutNav = (props: React.ComponentProps<'div'>) => (
  <div {...props} className={cx(cl['bk-page-layout__nav'], props.className)}/>
);

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
    Nav: PageLayoutNav,
  },
);
