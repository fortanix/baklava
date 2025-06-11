/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import { PageHeader } from './PageHeader/PageHeader.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';

import cl from './PageLayout.module.scss';

type PageLayoutProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
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
  },
);
