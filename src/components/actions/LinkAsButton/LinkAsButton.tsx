/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Link as LinkDefault } from '../Link/Link.tsx';
import { type ButtonProps, ButtonClassNames } from '../Button/Button.tsx';


type LinkProps = React.ComponentProps<typeof LinkDefault>;

type LinkAsButtonProps = LinkProps & {
  /** A custom `Link` component. Optional. */
  Link?: undefined | React.ComponentType<LinkProps>,
  
  // Link props
  //size?: LinkProps['size'], // Not relevant
  label?: NonNullable<LinkProps['label']>,
  
  // Button props
  kind?: NonNullable<ButtonProps['kind']>,
  nonactive?: NonNullable<ButtonProps['nonactive']>,
  disabled?: NonNullable<ButtonProps['disabled']>,
};

/**
 * Link component, but with the visual appearance of a button.
 */
export const LinkAsButton = (props: LinkAsButtonProps) => {
  const {
    Link = LinkDefault,
    label,
    kind = 'tertiary',
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
      className={cx(
        'bk',
        ButtonClassNames['bk-button'],
        { [ButtonClassNames['bk-button--primary']]: kind === 'primary' },
        { [ButtonClassNames['bk-button--secondary']]: kind === 'secondary' },
        { [ButtonClassNames['bk-button--tertiary']]: kind === 'tertiary' },
        { [ButtonClassNames['bk-button--nonactive']]: nonactive },
        { [ButtonClassNames['bk-button--disabled']]: disabled },
        props.className,
      )}
    />
  );
};
