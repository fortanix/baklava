/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Accordion.module.scss';
import { Icon } from '../../graphics/Icon/Icon.tsx';


export { cl as AccordionClassNames };

export type AccordionProps = React.PropsWithChildren<Omit<ComponentProps<'details'>, 'title'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The title of the accordion. */
  title: React.ReactNode,
}>;
/**
 * An accordion, i.e. collapsible container.
 */
export const Accordion = (props: AccordionProps) => {
  const { unstyled = false, title, children, ...propsRest } = props;
  return (
    <details
      role="presentation"
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-accordion']]: !unstyled,
      }, propsRest.className)}
    >
      <summary>
        <span className={cl['bk-accordion__title']}>
          {title}
        </span>
        <Icon icon="caret-down" className={cl['bk-accordion__collapse-icon']}/>
      </summary>
      <div className={cl['bk-accordion__content']}>
        {children}
      </div>
    </details>
  );
};
