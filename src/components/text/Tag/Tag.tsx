/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';

import cl from './Tag.module.scss';


export { cl as TagClassNames };

export type TagProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Some content to be displayed inside the tag. */
  content: React.ReactNode,

  /** Callback to remove the tag. If set, display a close icon, otherwise it is hidden. */
  onRemove?: () => void,
};

/**
 * A tag component.
 */
export const Tag = (props: TagProps) => {
  const {
    unstyled = false,
    content = null,
    onRemove,
    ...propsRest
  } = props;

  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-tag']]: !unstyled },
        { [cl['bk-tag--with-close-button']]: !!onRemove },
        propsRest.className,
      )}
    >
      {content}
      {onRemove && (
        <Button unstyled>
          <Icon icon="cross" className={cl['bk-tag__icon']} onClick={onRemove}/>
        </Button>
      )}
    </div>
  );
};
