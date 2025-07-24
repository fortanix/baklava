/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../util/component_util.tsx';

import './Scroller.scss';


type UseScrollerArgs = {
  /** Whether to include scroller styling automatically. Default: true. */
  includeStyling?: undefined | boolean,
  /** Which direction(s) can be scrolled in. Default: vertical. */
  scrollDirection?: undefined | 'vertical' | 'horizontal' | 'both',
};

type ScrollerProps = {
  // Note: `tabIndex` is not supported for now as Firefox and Chrome support automatic focusability of scrollers
  // (Discussion: https://github.com/fortanix/baklava/issues/75#issuecomment-2564578564)
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
    'bkl-util-scroller',
    { 'bkl-util-scroller--vertical': scrollDirection === 'vertical' },
    { 'bkl-util-scroller--horizontal': scrollDirection === 'horizontal' },
    { 'bkl-util-scroller--both': scrollDirection === 'both' },
  );
  
  return {
    className: includeStyling ? className : undefined,
  };
};
