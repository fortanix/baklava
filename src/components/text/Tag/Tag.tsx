/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../graphics/Icon/Icon.tsx';

import cl from './Tag.module.scss';


export { cl as TagClassNames };

export type TagProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Some content to be displayed inside the tag. */
  content: React.ReactNode,
};

/**
 * A tag component.
 */
export const Tag = (props: TagProps) => {
  const {
    unstyled = false,
    content = null,
    ...propsRest
  } = props;

  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-tag']]: !unstyled },
        propsRest.className,
      )}
    >
      {content}
      <Icon icon="cross" className={cl['bk-tag__icon']} />
    </div>
  );
};
