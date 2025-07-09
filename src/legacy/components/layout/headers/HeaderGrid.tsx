/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames/dedupe';
import * as React from 'react';

import { SpriteIcon as Icon } from '../../icons/Icon';
import { Button } from '../../buttons/Button';

import './HeaderGrid.scss';


export type AccountSwitcherProps = Omit<JSX.IntrinsicElements['div'], 'className'> & {
  className ?: {},
};
export const AccountSwitcher : React.FC<AccountSwitcherProps> = ({ className, ...props }) => {
  return (
    <Button plain {...props} className={cx('account-switcher', className)}>
      <div className="account-switcher__box">
        <div className="account-switcher-logo-container">
          <Icon name="account"
            icon={import('../../../assets/icons/account.svg?sprite')}
            className="account-logo"
          />
        </div>
        <div className="account-switcher__label">
          <div className="account-switcher__name">
            Test Account
          </div>
          <div className="account-switcher__role">
            Administrator
          </div>
        </div>
        <Icon name="arrow-expand"
          icon={import('../../../assets/icons/arrow-expand.svg?sprite')}
          className="icon-dropdown"
        />
      </div>
    </Button>
  );
};

export type HeaderGridProps = Omit<JSX.IntrinsicElements['header'], 'className'> & {
  children : React.ReactNode,
  className ?: {},
};
export const HeaderGrid : React.FC<HeaderGridProps> = ({ children, className, ...props }) => {
  return (
    <header {...props} className={cx('bkl-header bkl-header-grid', className)}>
      {children}
    </header>
  );
};

export default HeaderGrid;
