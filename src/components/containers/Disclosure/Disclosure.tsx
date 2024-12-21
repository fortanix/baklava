/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';

import cl from './Disclosure.module.scss';


export { cl as DisclosureClassNames };
export type DisclosureProps = Omit<ComponentProps<'details'>, 'title'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The title of the disclosure. */
  title: React.ReactNode,
  
  /** Additional props for the <summary> element. */
  summaryProps?: undefined | Omit<ComponentProps<'summary'>, 'children'>,
  
  /** Additional props for the details content. */
  contentProps?: undefined | Omit<ComponentProps<'div'>, 'children'>,
};
/**
 * An disclosure, i.e. a collapsible container.
 */
export const Disclosure = (props: DisclosureProps) => {
  const { unstyled = false, title, summaryProps = {}, contentProps = {}, children, ...propsRest } = props;
  
  /*
  Some notes on accessibility of `<details>`:
  - https://www.scottohara.me/blog/2022/09/12/details-summary.html (2022)
  - https://www.hassellinclusion.com/blog/accessible-accordions-part-2-using-details-summary (2019)
  - https://a11ysupport.io/tech/html/summary_element
  */
  
  return (
    <details
      {...propsRest}
      className={cx(
        { bk: true },
        { [cl['bk-disclosure']]: !unstyled },
        propsRest.className,
      )}
    >
      <summary {...summaryProps} className={cx(summaryProps.className)}>
        <span className={cl['bk-disclosure__title']}>
          {title}
        </span>
        <Icon icon="caret-down" className={cl['bk-disclosure__collapse-icon']}/>
      </summary>
      <div {...contentProps} className={cx(cl['bk-disclosure__content'], contentProps.className)}>
        {children}
      </div>
    </details>
  );
};
