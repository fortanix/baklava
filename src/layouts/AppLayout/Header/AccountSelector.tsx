/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import { DropdownMenuProvider } from '../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './AccountSelector.module.scss';


export { cl as AccountSelectorClassNames };

export type AccountSelectorProps = Omit<ComponentProps<typeof Button>, 'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
export const AccountSelector = (props: AccountSelectorProps) => {
  const { unstyled = false, children, ...propsRest } = props;
  
  return (
    <DropdownMenuProvider
      placement="bottom-start"
      items={
        <>
          <DropdownMenuProvider.Option optionKey="account-1" icon="accounts" label="Account 1"/>
          <DropdownMenuProvider.Option optionKey="account-2" icon="accounts" label="Account 2"/>
          <DropdownMenuProvider.Option optionKey="account-3" icon="accounts" label="Account 3"/>
        </>
      }
    >
      {({ props, state }) =>
        <Button unstyled
          {...props({
            ...propsRest,
            className: cx('bk', { [cl['bk-account-selector']]: !unstyled }, propsRest.className),
          })}
        >
          <Icon icon="groups" className={cl['bk-account-selector__icon']}
            decoration={{ type: 'background-circle' }}
          />
          {state.selectedOption === null ? 'Accounts' : state.selectedOption}
          <Icon icon="caret-down"/>
        </Button>
      }
    </DropdownMenuProvider>
  );
};
