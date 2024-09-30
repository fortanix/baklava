/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { type IconName, Icon } from '../../graphics/Icon/Icon.tsx';
import { Panel } from '../Panel/Panel.tsx';

import cl from './Alert.module.scss';


export { cl as AlertClassNames };

export type AlertProps = React.PropsWithChildren<ComponentProps<typeof Panel> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /* The kind of alert. */
  kind: 'info' | 'warning' | 'error' | 'success',
}>;


/**
 * Alert component.
 */
export const Alert = (props: AlertProps) => {
  const {
    children,
    unstyled = false,
    kind = 'info',
    ...propsRest
  } = props;
  
  const icon = ((): IconName => {
    switch (kind) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'alert';
      case 'success': return 'success';
      default: throw assertUnreachable(kind);
    }
  })();
  
  return (
    <Panel
      role="alert"
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-alert']]: !unstyled,
        [cl['bk-alert--info']]: kind === 'info',
        [cl['bk-alert--warning']]: kind === 'warning',
        [cl['bk-alert--error']]: kind === 'error',
        [cl['bk-alert--success']]: kind === 'success',
      }, props.className)}
    >
      <Icon icon={icon} className={cx(cl['bk-alert__icon'])}/>
      <article className={cx(cl['bk-alert__message'])}>{children}</article>
    </Panel>
  );
};
