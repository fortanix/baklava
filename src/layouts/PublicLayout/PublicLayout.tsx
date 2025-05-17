/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';

import { H1 } from '../../typography/Heading/Heading.tsx';
import { FortanixLogo } from '../../fortanix/FortanixLogo/FortanixLogo.tsx';
import { Card } from '../../components/containers/Card/Card.tsx';

import cl from './PublicLayout.module.scss';


export { cl as PublicLayoutClassNames };

type FortanixArmorLogoProps = ComponentProps<'figure'> & {
  /** Whether to stack the logo and product name. */
  stacked?: undefined | boolean,
};
const FortanixArmorLogo = (props: FortanixArmorLogoProps) => {
  const { stacked = false, ...propsRest } = props;
  return (
    <figure
      {...propsRest}
      className={cx(
        cl['bk-fortanix-armor-logo'],
        { [cl['bk-fortanix-armor-logo--stacked']]: stacked },
        propsRest.className,
    )}
    >
      <FortanixLogo/>
      <span className={cx(cl['product-name'])}>Armor</span>
    </figure>
  );
};

export type PublicLayoutProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Some property specific to `PublicLayout`. */
  variant?: undefined | 'x' | 'y',
};
/**
 * Layout for public pages that require no authentication (e.g. login, signup.).
 */
export const PublicLayout = (props: PublicLayoutProps) => {
  const { unstyled = false, variant, ...propsRest } = props;
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-public-layout']]: !unstyled },
        { [cl['bk-public-layout--x']]: variant === 'x' },
        { [cl['bk-public-layout--y']]: variant === 'y' },
        propsRest.className,
      )}
    >
      <div className={cx(cl['bk-public-layout__content'])}>
        <H1>Login</H1>
        <FortanixArmorLogo stacked={false}/>
      </div>
      
      <div className={cx(cl['bk-public-layout__guide'])}>
        <FortanixArmorLogo stacked className={cx('bk-theme--dark', cl['bk-public-layout__guide__logo'])}/>
        
        <div className={cx(cl['bk-public-layout__guide__cards'])}>
          <Card className={cx(cl['bk-public-layout__guide__card'], 'bk-prose')}>
            <Card.Heading>Test</Card.Heading>
            <ul>
              <li>Point 1</li>
              <li>Point 2</li>
              <li>Point 3</li>
            </ul>
          </Card>
          <Card className={cx(cl['bk-public-layout__guide__card'], 'bk-prose')}>
            <Card.Heading>Test</Card.Heading>
            <ul>
              <li>Point 1</li>
              <li>Point 2</li>
              <li>Point 3</li>
            </ul>
          </Card>
          <Card className={cx(cl['bk-public-layout__guide__card'], 'bk-prose')}>
            <Card.Heading>Test</Card.Heading>
            <ul>
              <li>Point 1</li>
              <li>Point 2</li>
              <li>Point 3</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
