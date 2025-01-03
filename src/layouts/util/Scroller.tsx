/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../util/componentUtil.ts';

import cl from './Scroller.module.scss';


type UseScrollerArgs = {
  includeStyling?: undefined | boolean,
  scrollDirection?: undefined | 'vertical' | 'horizontal' | 'both',
};

type ScrollerProps = {
  tabIndex: number,
  // Note: don't use `ClassNameArgument`, because that forces all consumers to apply `cx()`
  className?: undefined | string,
};

/**
 * Utility hook to create a scrolling element. Some care needs to be taken with scrollers for accessibility,
 * for example we need to make sure that scrollers are focusable for keyboard accessibility. This hook
 * adds the necessarily props to the element.
 */
export const useScroller = (args: UseScrollerArgs = {}): ScrollerProps => {
  const {
    includeStyling = true,
    scrollDirection = 'vertical',
  } = args;
  
  const className = cx(
    cl['bk-util-scroller'],
    { [cl['bk-util-scroller--vertical']]: scrollDirection === 'vertical' },
    { [cl['bk-util-scroller--horizontal']]: scrollDirection === 'horizontal' },
    { [cl['bk-util-scroller--both']]: scrollDirection === 'both' },
  );
  
  return {
    tabIndex: 0,
    className: includeStyling ? className : undefined,
  };
};
