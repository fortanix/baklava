/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * Determine whether the given item is programmatically focusable.
 * 
 * Note: determining whether an arbitrary element is focusable is more complex, see [1]. Here, we assume that the given
 * `itemElement` is known to be an focusable/interactive element. In addition, we are checking if something is
 * programmatically focusable, not necessarily user focusable. Thus, we don't check the `tabindex`.
 * 
 * [1] https://gist.github.com/oscarmarina/9ce95f491a4c53ed01d989de4a87c0c9
 */
export const isItemProgrammaticallyFocusable = (itemElement: HTMLElement): boolean => {
  return itemElement.matches(':not(:disabled, [hidden])');
};
