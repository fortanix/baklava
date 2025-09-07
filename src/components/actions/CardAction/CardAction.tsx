/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Button } from '../Button/Button.tsx';
import { Link } from '../Link/Link.tsx';
import { Card } from '../../containers/Card/Card.tsx';

import cl from './CardAction.module.scss';


export { cl as CardActionClassNames };

const CardActionButton = (props: React.ComponentProps<typeof Button>) =>
  <Button
    kind="primary"
    {...props}
    className={cx(cl['bk-card-action__action'], cl['bk-card-action__action--button'], props.className)}
  />;

type CardActionLinkProps = React.ComponentProps<typeof Link> & {
  Link?: undefined | React.ComponentType< React.ComponentProps<typeof Link>>,
};
const CardActionLink = ({ Link: LinkC = Link, ...propsRest }: CardActionLinkProps) =>
  <LinkC
    {...propsRest}
    className={cx(cl['bk-card-action__action'], cl['bk-card-action__action--link'], propsRest.className)}
  />;

const CardActionHeading = (props: React.ComponentProps<typeof Card.Heading>) =>
  <Card.Heading
    {...props}
    className={cx(cl['bk-card-action__heading'], props.className)}
  />;

const CardActionContent = (props: React.ComponentProps<'div'>) =>
  <div
    {...props}
    className={cx(cl['bk-card-action__content'], props.className)}
  />;

export type CardActionProps = ComponentProps<typeof Card> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the `CardAction` should be shown as selected. Default: `false`. */
  selected?: undefined | boolean,
};
/**
 * An interactive version of a `Card` component. `CardAction` presents itself to the user as clickable, focusable
 * and possibly selectable component. Though for accessibility reasons, the actual interactive element ("action") must
 * be a button or link embedded inside the card. Through CSS the interactive area of the action gets extended to the
 * boundary of the `CardAction` component.
 */
export const CardAction = Object.assign(
  (props: CardActionProps) => {
    const { unstyled = false, selected = false, ...propsRest } = props;
    return (
      <Card
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-card-action']]: !unstyled },
          { [cl['bk-card-action--selected']]: selected },
          propsRest.className,
        )}
      />
    );
  },
  {
    Button: CardActionButton,
    Link: CardActionLink,
    Heading: CardActionHeading,
    Content: CardActionContent,
  },
);
