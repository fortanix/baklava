/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { type ButtonProps, Button } from '../Button/Button.tsx';
import { type LinkProps, LinkClassNames } from '../Link/Link.tsx';

import cl from './ButtonAsLink.module.scss';


export { cl as ButtonAsLinkClassNames };

export type ButtonAsLinkProps = React.PropsWithChildren<ComponentProps<'button'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Link props
  size?: NonNullable<LinkProps['size']>,
  label?: NonNullable<LinkProps['label']>,
  
  // Button props
  //variant: NonNullable<ButtonProps['variant']>,
  //nonactive: NonNullable<ButtonProps['nonactive']>,
  //disabled: NonNullable<ButtonProps['disabled']>,
  onPress?: NonNullable<ButtonProps['onPress']>,
}>;


/**
 * Button, but with the appearance of a link.
 */
export const ButtonAsLink = (props: ButtonAsLinkProps) => {
  const {
    unstyled = false,
    size = 'medium',
    label,
    ...propsRest
  } = props;
  
  return (
    <Button
      {...propsRest}
      unstyled
      label={label}
      className={cx({
        bk: true,
        [cl['bk-button-as-link']]: !unstyled,
        [LinkClassNames['bk-link']]: !unstyled,
        [LinkClassNames['bk-link--small']]: size === 'small',
      }, props.className)}
    />
  );
};
