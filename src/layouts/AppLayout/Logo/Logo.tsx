/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import logoImage from '../../../assets/images/fortanix_logo_icon.svg';
import cl from './Logo.module.scss';


export type LogoProps = React.PropsWithChildren<ComponentProps<'figure'>>;

/**
 * Logo component.
 */
export const Logo = ({ ...propsRest }: LogoProps) => {
  const subtitle = 'Data Security Manager';
  
  return (
    <figure
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-app-logo'],
        propsRest.className,
      )}
    >
      <div className="_logo">
        <div className="_icon">
          <img alt={`Fortanix ${subtitle}`} src={logoImage}/>
        </div>
        <span className="_title">Fortanix</span>
        <span className="_subtitle">{subtitle}</span>
      </div>
    </figure>
  );
};
