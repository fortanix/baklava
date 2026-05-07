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
  
  /** The name of the icon to display. */
  icon: IconName,
  
  /**
   * The color to apply to the icon. Note: this should rarely be needed, icons will already adapt to the current color
   * when declared through CSS.
   */
  color?: undefined | string,
  
  /**
   * Whether the icon should be displayed inline. When true, the icon will adapt to its surrounding text.
   * Default: `true`.
   */
  inline?: undefined | boolean,
  
  /** Visual decoration to apply. */
  decoration?: undefined | Decoration,
}>;

type IconEventProps = Omit<IconProps, 'icon'> & {
  event: 'warning', // TODO: add other event types such as: success, error
};
/**
 * A variant of `Icon` for common "event" types like warning/success. Comes with predefined colors based on the event
 * type (e.g. green for success, orange for warning).
 */
const Event = ({ event, ...propsRest }: IconEventProps) => {
  // FIXME: currently `warning` is hardcoded to refer to `warning-filled`
  const icon = event === 'warning' ? 'warning-filled' : event;
  
  return (
    <Icon {...propsRest} className={cx(cl[`bk-icon-event--${event}`], propsRest.className)} icon={icon}/>
  );
};

export const Icon = Object.assign(
  ({ unstyled, icon, color = 'currentColor', inline = true, decoration, ...props }: IconProps) => {
    const symbolId = `#baklava-icon-${icon}`;
    
    if (!iconNames.has(icon)) {
      console.error(`Icon: no such icon "${icon}"`);
      return null;
    }
    
    return (
      <svg
        role="presentation"
        aria-hidden // https://stackoverflow.com/questions/61048356/why-do-we-use-aria-hidden-with-icons
        {...props}
        className={cx(
          'bk',
          { 'bk-inherit': inline }, // When displayed inline, inherit styling from context
          'icon', // Global class name (for generic targeting in CSS)
          { [cl['bk-icon']]: !unstyled },
          { [cl['bk-icon--inline']]: inline },
          { [cl['bk-icon--background-circle']]: decoration?.type === 'background-circle' },
          props.className,
        )}
      >
        <use href={symbolId} fill={color}/>
      </svg>
    );
  }, {
    Event,
  },
);
