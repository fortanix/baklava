/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { H5 } from '../../../typography/Heading/Heading.tsx';
import { Link as LinkDefault } from '../../actions/Link/Link.tsx';

import cl from './Card.module.scss';


export { cl as CardClassNames };


export type CardHeadingProps = ComponentProps<typeof H5>;
export const CardHeading = (props: CardHeadingProps) => {
  return <H5 {...props} className={cx(cl['bk-card__heading'], props.className)}/>;
};

export type CardHeadingLinkProps = ComponentProps<typeof LinkDefault> & {
  Link?: undefined | typeof LinkDefault,
};
export const CardHeadingLink = ({ Link = LinkDefault, ...propsRest }: CardHeadingLinkProps) => {
  return (
    <Link
      unstyled
      {...propsRest}
      className={cx(cl['bk-card__heading'], cl['bk-card__heading-link'], propsRest.className)}
    />
  );
};

export type CardProps = ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** If enabled, removes the outside border/padding. For use in nested contexts. Default: false. */
  flat?: undefined | boolean,
};
/**
 * Card component, a container similar to a panel but smaller and usually used in a list or grid.
 */
export const Card = Object.assign(
  (props: CardProps) => {
    const { children, unstyled = false, flat = false, ...propsRest } = props;
    
    return (
      <section
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-card']]: !unstyled },
          { [cl['bk-card--flat']]: flat },
          propsRest.className,
        )}
      >
        {children}
      </section>
    );
  },
  {
    Heading: CardHeading,
    HeadingLink: CardHeadingLink,
  },
);
