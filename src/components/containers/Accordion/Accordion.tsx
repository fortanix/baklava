/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Accordion.module.scss';
import { Icon } from '../../graphics/Icon/Icon.tsx';


export { cl as AccordionClassNames };
export type AccordionProps = Omit<ComponentProps<'details'>, 'title'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The title of the accordion. */
  title: React.ReactNode,
  
  /** Additional props for the <summary> element. */
  summaryProps?: undefined | Omit<ComponentProps<'summary'>, 'children'>,
  
  /** Additional props for the details content. */
  contentProps?: undefined | Omit<ComponentProps<'div'>, 'children'>,
};
/**
 * An accordion, i.e. a collapsible container.
 */
export const Accordion = (props: AccordionProps) => {
  const { unstyled = false, title, summaryProps = {}, contentProps = {}, children, ...propsRest } = props;
  return (
    <details
      {...propsRest}
      className={cx(
        { bk: true },
        { [cl['bk-accordion']]: !unstyled },
        propsRest.className,
      )}
    >
      <summary {...summaryProps} className={cx(summaryProps.className)}>
        <span className={cl['bk-accordion__title']}>
          {title}
        </span>
        <Icon icon="caret-down" className={cl['bk-accordion__collapse-icon']}/>
      </summary>
      <div {...contentProps} className={cx(cl['bk-accordion__content'], contentProps.className)}>
        {children}
      </div>
    </details>
  );
};
