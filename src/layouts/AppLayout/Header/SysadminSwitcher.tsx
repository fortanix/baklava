/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';

import cl from './SysadminSwitcher.module.scss';


export { cl as SysadminSwitcherClassNames };

export type SysadminSwitcherProps = ComponentProps<typeof Button> & {
};
/**
 * Button to switch to the system administration view.
 */
export const SysadminSwitcher = (props: SysadminSwitcherProps) => {
  const { ...propsRest } = props;
  return (
    <Button unstyled
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-sysadmin-switcher'],
        propsRest.className,
      )}
    >
      <Icon icon="system-admin" className={cx(cl['bk-sysadmin-switcher__icon'])}/>
      <span className={cx(cl['bk-sysadmin-switcher__title'])}>System Administration</span>
      <span className={cx(cl['bk-sysadmin-switcher__subtitle'])}>System Administrator</span>
    </Button>
  );
};
