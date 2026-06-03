/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { H5 } from '../../../typography/Heading/Heading.tsx';
import { Link as LinkDefault } from '../../actions/Link/Link.tsx';
import { Spinner } from '../../graphics/Spinner/Spinner.tsx';

import cl from './Card.module.scss';


export { cl as CardClassNames };


export type CardHeadingProps = ComponentProps<typeof H5> & {
  icon?: undefined | React.ReactElement,
};
export const CardHeading = ({ icon, ...propsRest }: CardHeadingProps) => {
  return (
    <H5 {...propsRest} className={cx(cl['bk-card__heading'], propsRest.className)}>
      {icon &&
        <>
          <span className={cx('_icon', cl['bk-card__heading__icon'])}>{icon}</span>
          <span className={cx('_content', cl['bk-card__heading__content'])}>{propsRest.children}</span>
        </>
      }
      {!icon && propsRest.children}
    </H5>
  );
};

export type CardHeadingLinkProps = ComponentProps<typeof LinkDefault> & {
  icon?: undefined | React.ReactElement,
  Link?: undefined | typeof LinkDefault,
};
export const CardHeadingLink = ({ icon, Link = LinkDefault, ...propsRest }: CardHeadingLinkProps) => {
  return (
    <Link
      unstyled
      {...propsRest}
      className={cx(cl['bk-card__heading'], cl['bk-card__heading--link'], propsRest.className)}
    >
      {icon &&
        <>
          <span className={cx('_icon', cl['bk-card__heading__icon'])}>{icon}</span>
          <span className={cx('_content', cl['bk-card__heading__content'])}>{propsRest.children}</span>
        </>
      }
      {!icon && propsRest.children}
    </Link>
  );
};

export type CardProps = ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** If enabled, removes the outside border/padding. For use in nested contexts. Default: false. */
  flat?: undefined | boolean,
  
  /** Whether the panel display a loading indicator, instead of it's children */
  status?: undefined | 'ready' | 'loading',
};
/**
 * Card component, a container similar to a panel but smaller and usually used in a list or grid.
 */
export const Card = Object.assign(
  (props: CardProps) => {
    const { children, unstyled = false, flat = false, status = 'ready', ...propsRest } = props;
    
    return (
      <article
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-card']]: !unstyled },
          { [cl['bk-card--flat']]: flat },
          { [cl['bk-card--empty']]: !children },
          propsRest.className,
        )}
        inert={status === 'loading'}
      >
        {children}
        {status === 'loading' && (
          <div className={cl['bk-card__loading']}>
            <Spinner className={cl['bk-card__loading__spinner']}/>
          </div>
        )}
      </article>
    );
  },
  {
    Heading: CardHeading,
    HeadingLink: CardHeadingLink,
  },
);
