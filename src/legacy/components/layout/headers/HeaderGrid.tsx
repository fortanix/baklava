/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Button } from '../../buttons/Button.tsx';

import './HeaderGrid.scss';


type AccountSwitcherProps = Omit<ComponentProps<typeof Button>, 'children'>;
export const AccountSwitcher = ({ className, ...propsRest }: AccountSwitcherProps) => {
  return (
    <Button plain {...propsRest} className={cx('bkl account-switcher', className)}>
      <div className="account-switcher__box">
        <div className="account-switcher-logo-container">
          <BaklavaIcon icon="account" className="account-logo"/>
        </div>
        <div className="account-switcher__label">
          <div className="account-switcher__name">
            Test Account
          </div>
          <div className="account-switcher__role">
            Administrator
          </div>
        </div>
        <BaklavaIcon icon="arrow-expand" className="icon-dropdown"/>
      </div>
    </Button>
  );
};

type HeaderGridProps = ComponentProps<'header'>;
export const HeaderGrid = ({ children, className, ...propsRest }: HeaderGridProps) => {
  return (
    <header {...propsRest} className={cx('bkl bkl-header bkl-header-grid', className)}>
      {children}
    </header>
  );
};
