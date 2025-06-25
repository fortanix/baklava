/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Icon, IconName } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';

import cl from './SysadminSwitcher.module.scss';


export { cl as SysadminSwitcherClassNames };

export type SysadminSwitcherProps = ComponentProps<typeof Button> & {
  /** The icon to show in the sysadmin switcher. */
  iconName?: undefined | IconName,
  
  /** The title. */
  title?: undefined | string,
  
  /** A subtitle. Optional. */
  subtitle?: undefined | string,
};
/**
 * Button to switch to the system administration view.
 */
export const SysadminSwitcher = (props: SysadminSwitcherProps) => {
  const { icon = 'system-admin', title, subtitle, ...propsRest } = props;
  return (
    <Button unstyled
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-sysadmin-switcher'],
        propsRest.className,
      )}
    >
      <Icon icon={icon} className={cx(cl['bk-sysadmin-switcher__icon'])}/>
      
      <span className={cx(cl['bk-sysadmin-switcher__title'])}>
        {title ?? 'System Administration'}
      </span>
      
      {subtitle &&
        <span className={cx(cl['bk-sysadmin-switcher__subtitle'])}>
          {subtitle}
        </span>
      }
    </Button>
  );
};
