/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type ClassNameArgument } from '../../../util/componentUtil.ts';
import { type IconName } from '../../graphics/Icon/Icon.tsx';
import { IconButton } from '../../actions/IconButton/IconButton.tsx';
import { type ItemKey, type MenuProviderProps, MenuProvider } from '../MenuProvider/MenuProvider.tsx';


export type { ItemKey };

export type ContextMenuProviderProps = MenuProviderProps & {
  /**
   * An icon name to be displayed as an IconButton. Alternatively, if you need a custom icon, pass a children component
   * directly.
   */
  icon?: undefined | IconName,
  
  /** Custom class name to be added to IconButton */
  iconClassName?: undefined | ClassNameArgument,
};

/**
 * A simple wrapper for the MenuProvider with a ellipsis menu as a button trigger.
 */
export const ContextMenuProvider = Object.assign(
  (props: ContextMenuProviderProps) => {
    const {
      label = 'Context Menu',
      icon = 'ellipsis-vertical',
      placement = 'bottom-end',
      children,
      iconClassName,
    } = props;
    
    return (
      <MenuProvider placement={placement} {...props}>
        {children || (
          <IconButton icon={icon} label={label} className={iconClassName}/>
        )}
      </MenuProvider>
    );
  }, {
    Option: MenuProvider.Option,
    Static: MenuProvider.Static,
    Action: MenuProvider.Action,
    Link: MenuProvider.Link,
    Segment: MenuProvider.Segment,
    SegmentVirtual: MenuProvider.SegmentVirtual,
    Group: MenuProvider.Group,
    Footer: MenuProvider.Footer,
  },
);
