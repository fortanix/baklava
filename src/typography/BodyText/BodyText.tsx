/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './BodyText.module.scss';


export { cl as BodyTextClassNames };

export type BodyTextProps = React.PropsWithChildren<ComponentProps<'article'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * BodyText component.
 */
export const BodyText = ({ unstyled, ...propsRest }: BodyTextProps) => {
  return (
    <article
      {...propsRest}
      className={cx({
        bk: true,
        ['bk-body-text']: !unstyled,
      }, propsRest.className)}
    />
  );
};
