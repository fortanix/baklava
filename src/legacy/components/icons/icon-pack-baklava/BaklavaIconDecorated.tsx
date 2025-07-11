/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon as Icon } from './BaklavaIcon.tsx';

import './BaklavaIconDecorated.scss';


export type Decoration =
  | 'highlight' // Note: same as `background-circle` but auto-adapts background color to context
  | 'background-circle'
  | 'border-circle';

/**
 * Extension of `Icon`, but with a visual decoration applied.
 */
type BaklavaIconDecoratedProps = ComponentProps<typeof Icon> & {
  decorations?: undefined | Array<Decoration>,
  
  // Shorthands
  highlight?: undefined | boolean,
  border?: undefined | boolean,
};
export const BaklavaIconDecorated = (props: BaklavaIconDecoratedProps) => {
  const { decorations = [], highlight = false, border = false, ...propsRest } = props;
  
  const decorationsParsed = [
    ...decorations,
    ...(highlight ? ['highlight'] : []),
    ...(border ? ['border-circle'] : []),
  ];
  
  return (
    <Icon
      {...propsRest}
      className={cx(
        'baklava-icon--decorated',
        ...decorationsParsed.map(decoration => `baklava-icon--decorated--${decoration}`),
        propsRest.className,
      )}
    />
  );
};
