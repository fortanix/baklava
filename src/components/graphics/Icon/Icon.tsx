/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { icons } from '../../../assets/icons/_icons.ts';
import cl from './Icon.module.scss';


export { cl as IconClassNames };

export type IconName = keyof typeof icons;
export const iconNames = new Set(Object.keys(icons) as Array<IconName>);
export const isIconName = (iconName: string): iconName is IconName => {
  return (iconNames as Set<string>).has(iconName);
};

export type Decoration = (
  | { type: 'background-circle' }
);

export type IconProps = React.PropsWithChildren<ComponentProps<'svg'> & {
  /** Whether this component should be unstyled. */
  unstyled?: boolean,
  
  /** The name of the icon to display */
  icon: IconName,
  
  /** The color to apply to the icon */
  color?: undefined | string,
  
  /** Visual decoration to apply */
  decoration?: undefined | Decoration,
}>;
export const Icon = ({ unstyled, icon, color = 'currentColor', decoration, ...props }: IconProps) => {
  const symbolId = `#baklava-icon-${icon}`;
  
  return (
    <svg
      role="img"
      aria-label={`${icon} icon`}
      aria-hidden // https://stackoverflow.com/questions/61048356/why-do-we-use-aria-hidden-with-icons
      {...props}
      className={cx({
        bk: true,
        [cl['bk-icon']]: !unstyled,
        [cl['bk-icon--background-circle']]: decoration?.type === 'background-circle',
      }, props.className)}
    >
      <use href={symbolId} fill={color}/>
    </svg>
  );
};
