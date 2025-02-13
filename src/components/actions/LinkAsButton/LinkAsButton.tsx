/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { type LinkProps, Link } from '../Link/Link.tsx';
import { type ButtonProps, ButtonClassNames } from '../Button/Button.tsx';


/**
 * A link, but with the visual appearance of a button.
 */
export type LinkAsButtonProps = React.PropsWithChildren<ComponentProps<'a'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Link props
  //size?: LinkProps['size'], // Not relevant
  label?: NonNullable<LinkProps['label']>,
  
  // Button props
  kind?: NonNullable<ButtonProps['kind']>,
  nonactive?: NonNullable<ButtonProps['nonactive']>,
  disabled?: NonNullable<ButtonProps['disabled']>,
}>;


/**
 * Link component, but with the appearance of a button.
 */
export const LinkAsButton = (props: LinkAsButtonProps) => {
  const {
    unstyled = false,
    label,
    kind,
    nonactive,
    disabled,
    ...propsRest
  } = props;
  
  return (
    <Link
      {...propsRest}
      unstyled
      label={label}
      className={cx({
        bk: true,
        [ButtonClassNames['bk-button']]: !unstyled,
        [ButtonClassNames['bk-button--primary']]: kind === 'primary',
        [ButtonClassNames['bk-button--secondary']]: kind === 'secondary',
        [ButtonClassNames['bk-button--tertiary']]: kind === 'tertiary',
        [ButtonClassNames['bk-button--nonactive']]: nonactive,
        [ButtonClassNames['bk-button--disabled']]: disabled,
      }, props.className)}
      size="medium"
    />
  );
};
