/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';

import { Link as LinkDefault } from '../Link/Link.tsx';
import { type ButtonProps, ButtonClassNames } from '../Button/Button.tsx';


type LinkProps = React.ComponentProps<typeof LinkDefault>;

type LinkAsButtonProps = LinkProps & {
  /** A custom `Link` component. Optional. */
  Link?: undefined | React.ComponentType<LinkProps>,
  
  // Link props
  //size?: LinkProps['size'], // Not relevant
  label?: undefined | NonNullable<LinkProps['label']>,
  
  // Button props
  trimmed?: undefined | NonNullable<ButtonProps['trimmed']>,
  wrap?: undefined | NonNullable<ButtonProps['wrap']>,
  kind?: undefined | NonNullable<ButtonProps['kind']>,
  variant?: undefined | NonNullable<ButtonProps['variant']>,
  nonactive?: undefined | NonNullable<ButtonProps['nonactive']>,
  disabled?: undefined | NonNullable<ButtonProps['disabled']>,
};

/**
 * Link component, but with the visual appearance of a button.
 */
export const LinkAsButton = (props: LinkAsButtonProps) => {
  const {
    Link = LinkDefault,
    label,
    trimmed,
    wrap,
    kind = 'tertiary',
    variant = 'normal',
    nonactive,
    disabled,
    ...propsRest
  } = props;
  
  return (
    <Link
      label={label}
      size="medium"
      {...propsRest}
      unstyled
      disabled={disabled}
      className={cx(
        'bk',
        ButtonClassNames['bk-button'],
        { [ButtonClassNames['bk-button--trimmed']]: trimmed },
        { [ButtonClassNames['bk-button--wrap']]: wrap },
        { [ButtonClassNames['bk-button--primary']]: kind === 'primary' },
        { [ButtonClassNames['bk-button--secondary']]: kind === 'secondary' },
        { [ButtonClassNames['bk-button--tertiary']]: kind === 'tertiary' },
        { [ButtonClassNames['bk-button--variant-normal']]: variant === 'normal' },
        { [ButtonClassNames['bk-button--variant-basic']]: variant === 'basic' },
        { [ButtonClassNames['bk-button--disabled']]: disabled },
        { [ButtonClassNames['bk-button--nonactive']]: nonactive },
        props.className,
      )}
    />
  );
};
