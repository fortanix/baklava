/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Link.module.scss';


export { cl as LinkClassNames };

export type LinkProps = React.PropsWithChildren<ComponentProps<'a'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /* Size of the link */
  size?: 'small' | 'medium',
  
  /**
   * The label of the link. Additional UI elements may be added, e.g. a loading indicator. If full control over
   * the link content is desired, use `children` instead, this overrides the `label`.
   */
  label?: undefined | string,
}>;


/**
 * Link component.
 */
export const Link = (props: LinkProps) => {
  const {
    children,
    unstyled = false,
    size = 'medium',
    label,
    href,
    ...propsRest
  } = props;
  
  // Note: not really necessary anymore in modern browsers, but doesn't hurt
  // https://stackoverflow.com/questions/50709625/link-with-target-blank-still-vulnerable
  const rel = propsRest.target === '_blank' ? 'noopener noreferrer' : undefined;
  
  return (
    <a
      rel={rel}
      href={href}
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-link'],
        { [cl['bk-link--unstyled']]: unstyled },
        { [cl['bk-link--small']]: size === 'small' },
        props.className,
      )}
    >
      {children ?? label}
    </a>
  );
};
