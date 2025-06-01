/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import { type ItemDetails, MenuProvider } from '../../../components/overlays/MenuProvider/MenuProvider.tsx';

import cl from './AccountSelector.module.scss';


export { cl as AccountSelectorClassNames };


export type AccountSelectorProps = Omit<ComponentProps<typeof Button>, 'label' | 'children'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The accounts list to be shown in the dropdown menu. */
  accounts: React.ComponentProps<typeof MenuProvider>['items'],
  
  /** The selected account. To access the selected account, pass a render prop. */
  children: (selectedAccount: null | ItemDetails) => React.ReactNode,
};
export const AccountSelector = Object.assign(
  (props: AccountSelectorProps) => {
    const { unstyled = false, children, accounts, ...propsRest } = props;
    
    return (
      <MenuProvider
        menuSize="large"
        label="Account selector"
        placement="bottom-start"
        items={accounts}
        offset={12} // Compensate for header padding
      >
        {({ props, selectedOption }) =>
          <Button unstyled
            {...props({
              ...propsRest,
              className: cx('bk', { [cl['bk-account-selector']]: !unstyled }, propsRest.className),
            })}
          >
            <Icon icon="account" className={cx(cl['bk-account-selector__icon'])}
              decoration={{ type: 'background-circle' }}
            />
            <span className={cx(cl['bk-account-selector__label'])}>{children(selectedOption ?? null)}</span>
            <Icon icon="caret-down" className={cx(cl['bk-account-selector__caret'])}/>
          </Button>
        }
      </MenuProvider>
    );
  },
  {
    Header: MenuProvider.Header,
    Option: MenuProvider.Option,
    Action: MenuProvider.Action,
    FooterActions: MenuProvider.FooterActions,
  },
);
