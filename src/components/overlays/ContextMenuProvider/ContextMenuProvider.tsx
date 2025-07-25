/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IconButton } from '../../actions/IconButton/IconButton.tsx';
import { MenuProvider, type MenuProviderProps } from '../MenuProvider/MenuProvider.tsx';
import * as ListBox from '../../forms/controls/ListBox/ListBox.tsx';


export type ContextMenuProviderProps = MenuProviderProps;

export type ItemKey = ListBox.ItemKey;

/**
 * A simple wrapper for the MenuProvider with a ellipsis menu as a button trigger.
 */
export const ContextMenuProvider = Object.assign(
  (props: ContextMenuProviderProps) => {
    const {
      label = 'Context Menu',
      placement = 'bottom-end',
    } = props;
    return (
      <MenuProvider placement={placement} {...props}>
        <IconButton icon="ellipsis-vertical" label={label}/>
      </MenuProvider>
    );
  }, {
    Static: ListBox.Static,
    Option: ListBox.Option,
    Action: ListBox.Action,
    Header: ListBox.Header,
    FooterActions: ListBox.FooterActions,
  }
);
