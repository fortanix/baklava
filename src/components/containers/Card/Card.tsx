/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { H5 } from '../../../typography/Heading/Heading.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import cl from './Card.module.scss';


export { cl as CardClassNames };


export type CardHeadingProps = React.PropsWithChildren<ComponentProps<typeof H5>>;
export const CardHeading = (props: CardHeadingProps) => {
  return <H5 {...props} className={cx(cl['bk-card__heading'], props.className)}/>;
};

export type CardProps = React.PropsWithChildren<ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Card component, a container similar to a panel but smaller and usually used in a list or grid.
 */
export const Card = Object.assign(
  (props: CardProps) => {
    const { children, unstyled = false, ...propsRest } = props;
    
    return (
      <section
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-card']]: !unstyled },
          propsRest.className,
        )}
      >
        {children}
      </section>
    );
  },
  {
    Heading: CardHeading,
  },
);
