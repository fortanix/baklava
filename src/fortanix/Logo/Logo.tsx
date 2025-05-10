/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import logoImage from  '../../assets/fortanix/fortanix_logo_icon.svg';
import cl from './Logo.module.scss';


export type LogoProps = ComponentProps<'figure'> & {
  subtitle?: undefined | React.ReactNode,
  subtitleTrademark?: undefined | boolean,
};

/**
 * Logo component.
 */
export const Logo = ({ subtitle, subtitleTrademark, ...propsRest }: LogoProps) => {
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
        <img alt={`Fortanix ${subtitle ?? ''}`} src={logoImage} className="_icon"/>
        <span className="_title">Fortanix</span>
        {subtitle && 
          <span className="_subtitle">
            {subtitle}
            {subtitleTrademark && <sup className="_subtitle-trademark">&trade;</sup>}
          </span>
        }
      </div>
    </figure>
  );
};
