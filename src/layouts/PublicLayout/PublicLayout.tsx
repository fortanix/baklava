/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import { useScroller } from '../util/Scroller.tsx';

import { type IconName } from '../../components/graphics/Icon/Icon.tsx';
//import { FortanixLogo } from '../../fortanix/FortanixLogo/FortanixLogo.tsx';
import { Card } from '../../components/containers/Card/Card.tsx';

import fortanixLogo from '../../assets/fortanix/fortanix-logo.svg';
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
      {/* <FortanixLogo/> */}
      <img alt="Fortanix" src={fortanixLogo} width="180" className={cl['fortanix-logo-image']}/>
      <span className={cx(cl['product-name'])}>Armor</span>
    </figure>
  );
};

type HeadingProps = ComponentProps<'header'>;
const Heading = (props: HeadingProps) => {
  const { children, ...propsRest } = props;
  return (
    <header {...propsRest} className={cx(cl['bk-public-layout__content__header'], propsRest.className)}>
      {children}
    </header>
  );
};

type ProductInfoCardHeadingProps = ComponentProps<typeof Card.Heading> & {
  /** The icon to show along with the heading. */
  icon?: undefined | IconName,
};
const ProductInfoCardHeading = (props: ProductInfoCardHeadingProps) => {
  const { children, icon, ...propsRest } = props;
  return (
    <Card.Heading {...propsRest} className={cx(cl['bk-public-layout__product-info-card__heading'])}>
      {children}
    </Card.Heading>
  );
};

type ProductInfoCardProps = ComponentProps<typeof Card>;
const ProductInfoCard = Object.assign(
  (props: ProductInfoCardProps) => {
    const { children, ...propsRest } = props;
    return (
      <Card {...propsRest} className={cx(cl['bk-public-layout__product-info-card'], 'bk-prose')}>
        {children}
      </Card>
    );
  },
  {
    Heading: ProductInfoCardHeading,
  },
);

export type PublicLayoutProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Content heading. */
  heading?: undefined | React.ReactNode,
  
  /** Product information to show alongside the main content. */
  productInfoCards?: undefined | React.ReactNode,
};
/**
 * Layout for public pages that require no authentication (e.g. login, signup.).
 */
export const PublicLayout = Object.assign(
  (props: PublicLayoutProps) => {
    const { unstyled = false, children, heading, productInfoCards, ...propsRest } = props;
    
    const contentScroller = useScroller();
    const productInfoScroller = useScroller();
    
    return (
      <div
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-public-layout']]: !unstyled },
          propsRest.className,
        )}
      >
        <div {...contentScroller} className={cx(cl['bk-public-layout__content'], contentScroller.className)}>
          {heading}
          
          {children}
        </div>
        
        <div
          {...productInfoScroller}
          className={cx(cl['bk-public-layout__product-info'], productInfoScroller.className)}
        >
          <FortanixArmorLogo stacked className={cx('bk-theme--dark', cl['bk-public-layout__product-info__logo'])}/>
          
          <div className={cx(cl['bk-public-layout__product-info__cards'])}>
            {productInfoCards}
          </div>
        </div>
      </div>
    );
  },
  {
    FortanixArmorLogo,
    Heading,
    ProductInfoCard,
  },
);
