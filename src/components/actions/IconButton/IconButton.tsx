/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type IconName, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../Button/Button.tsx';

import cl from './IconButton.module.scss';


export { cl as IconButtonClassNames };

export type IconButtonProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Class name to apply to the outer container. */
  classx?: undefined | ClassNameArgument,
  
  /** The accessible name for the icon. */
  label: string,
  
  /** The icon to use as button label. */
  icon: IconName,
  
  /** Any additional props to apply to the inner `Icon`. */
  iconProps?: undefined | Omit<ComponentProps<typeof Icon>, 'icon'>,
  
  /** Whether the component should be displayed as an inline element. Default: false. */
  inline?: undefined | boolean,
}>;
/**
 * A button where the label is just an icon.
 */
export const IconButton = (props: IconButtonProps) => {
  const { unstyled = false, classx, label, icon, iconProps = {}, ...propsRest } = props;
  
  return (
    <Button
      unstyled
      trimmed
      aria-label={label}
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-icon-button']]: !unstyled },
        propsRest.className,
        classx,
      )}
    >
      <Icon {...iconProps} icon={icon}/>
    </Button>
  );
};
