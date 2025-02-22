/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Prose.module.scss';


export { cl as ProseClassNames };

export type ProseProps = React.PropsWithChildren<ComponentProps<'article'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Prose component.
 */
export const Prose = ({ unstyled, ...propsRest }: ProseProps) => {
  return (
    <article
      {...propsRest}
      className={cx({
        bk: true,
        'bk-prose': !unstyled,
      }, propsRest.className)}
    />
  );
};
