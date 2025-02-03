/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import { DropdownMenuProvider } from '../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './UserMenu.module.scss';


export { cl as UserMenuClassNames };

export type UserMenuProps = Omit<ComponentProps<typeof Button>, 'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The user's name */
  userName?: undefined | string,
};
export const UserMenu = (props: UserMenuProps) => {
  const { unstyled = false, children, userName, ...propsRest } = props;
  
  const renderContent = () => {
    if (userName) {
      return (
        <>
          <Icon icon="user" className={cx(cl['bk-user-menu__user-icon'])}/>
          <span className={cx(cl['bk-user-menu__user-name'])}>{userName}</span>
        </>
      );
    }
    return children;
  };
  
  return (
    <DropdownMenuProvider
      label="User menu"
      placement="bottom-end"
      items={
        <>
          <DropdownMenuProvider.Action itemKey="profile" label="Profile"
            onActivate={({ close }) => {
              console.log(`Activated profile`);
              close();
            }}
          />
          <DropdownMenuProvider.Action itemKey="sign-out" label="Sign out"
            onActivate={({ close }) => {
              console.log(`Activated sign out`);
              close();
            }}
          />
        </>
      }
    >
      <Button unstyled
        {...propsRest}
        className={cx('bk', { [cl['bk-user-menu']]: !unstyled }, propsRest.className)}
      >
        {renderContent()}
      </Button>
    </DropdownMenuProvider>
  );
};
