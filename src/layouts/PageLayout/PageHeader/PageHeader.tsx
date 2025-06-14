/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { H3, H6 } from '../../../typography/Heading/Heading.tsx';
import { TextLine } from '../../../components/text/TextLine/TextLine.tsx';

import cl from './PageHeader.module.scss';


export { cl as PageHeaderClassNames };


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
export const PageHeader = Object.assign(
  (props: PageHeaderProps) => {
    const { unstyled = false, title, titleSelect, children, ...propsRest } = props;
    
    return (
      <header
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-page-header']]: !unstyled },
          propsRest.className,
        )}
      >
        {title && (
          <H3>
            <TextLine>{title}</TextLine>
          </H3>
        )}
        {titleSelect && (
          <H6 className={cl['bk-page-header__select']}>{titleSelect}</H6>
        )}
        {children && (
          <div className={cx(
            'bk',
            { [cl['bk-page-header__actions']]: !unstyled },
          )}>
            {children}
          </div>
        )}
      </header>
    );
  },
  {},
);
