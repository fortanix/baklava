/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as React from 'react';


type TabDirection = 'vertical' | 'horizontal';
type HandleTabKeyDownArgs = {
  evt: React.KeyboardEvent<HTMLButtonElement>,
  index: number, // current index inside of tabs
  tabs: Array<HTMLButtonElement>,
  direction?: TabDirection,
  handleExtraKeyDown?: (evt: React.KeyboardEvent<HTMLButtonElement>) => void,
};
export const handleTabKeyDown = (args: HandleTabKeyDownArgs) => {
  const { evt, index, tabs = [], direction = 'horizontal', handleExtraKeyDown } = args;
  
  const horizontal = direction === 'horizontal';
  const vertical = direction === 'vertical';
  
  let newIndex = index;
  
  switch (evt.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      if ((horizontal && evt.key === 'ArrowRight') || (vertical && evt.key === 'ArrowDown')) {
        newIndex = (index + 1) % tabs.length;
      }
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      if ((horizontal && evt.key === 'ArrowLeft') || (vertical && evt.key === 'ArrowUp')) {
        newIndex = (index - 1 + tabs.length) % tabs.length;
      }
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = tabs.length - 1;
      break;
    case 'Delete':
      tabs[index]?.blur();
      return;
  }
  
  tabs[newIndex]?.focus();
  
  if (handleExtraKeyDown) {
    handleExtraKeyDown(evt);
  }
};

type RadioDirection = 'vertical' | 'horizontal';
type HandleRadioKeyDownArgs = {
  evt: React.KeyboardEvent<HTMLInputElement>,
  index: number, // Current index inside of radio items
  radioItems: Array<HTMLInputElement>,
  direction?: RadioDirection,
  handleExtraKeyDown?: (evt: React.KeyboardEvent<HTMLInputElement>) => void,
};
export const handleRadioKeyDown = (args: HandleRadioKeyDownArgs) => {
  const { evt, index, radioItems = [], direction = 'horizontal', handleExtraKeyDown } = args;

  const horizontal = direction === 'horizontal';
  const vertical = direction === 'vertical';

  let newIndex = index;

  const findNextFocus = (direction: 1 | -1) => {
    // check whether next item is disabled or not. Keep searching next item until finding not disabled item.
    for (let i = 1; i <= radioItems.length; i++) {
      const nextIndex = (index + direction * i + radioItems.length) % radioItems.length;
      if (!radioItems[nextIndex]?.disabled) {
        return nextIndex;
      }
    }

    // fallback
    return (index + direction + radioItems.length) % radioItems.length;
  };

  switch (evt.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      if ((horizontal && evt.key === 'ArrowRight') || (vertical && evt.key === 'ArrowDown')) {
        newIndex = findNextFocus(1);
      }
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      if ((horizontal && evt.key === 'ArrowLeft') || (vertical && evt.key === 'ArrowUp')) {
        newIndex = findNextFocus(-1);
      }
      break;
  }

  radioItems[newIndex]?.focus();

  if (handleExtraKeyDown) {
    handleExtraKeyDown(evt);
  }
};

type HandleNavKeyDownArgs = {
  evt: React.KeyboardEvent<HTMLAnchorElement>,
  index: number, // current index inside of navs
  navItems: HTMLAnchorElement[],
  direction?: TabDirection,
  toggleSidebar: () => void,
  handleExtraKeyDown?: (evt: React.KeyboardEvent<HTMLAnchorElement>) => void,
};
export const handleNavKeyDown = (args: HandleNavKeyDownArgs) => {
  const { evt, index, navItems = [], direction = 'vertical', toggleSidebar, handleExtraKeyDown } = args;
  
  const horizontal = direction === 'horizontal';
  const vertical = direction === 'vertical';
  
  let newIndex = index;
  
  const findNextFocus = (direction: 1 | -1) => {
    // Check whether next item is disabled or not. Keep searching next item until finding not disabled item.
    for (let i = 1; i <= navItems.length; i++) {
      const nextIndex = (index + direction * i + navItems.length) % navItems.length;
      
      if (navItems[nextIndex]?.getAttribute('aria-disabled') === 'false') {
        return nextIndex;
      }
    }
    
    // Fallback
    return (index + direction + navItems.length) % navItems.length;
  };
  
  switch (evt.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      if ((horizontal && evt.key === 'ArrowRight') || (vertical && evt.key === 'ArrowDown')) {
        newIndex = findNextFocus(1);
      } else {
        toggleSidebar();
      }
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      if ((horizontal && evt.key === 'ArrowLeft') || (vertical && evt.key === 'ArrowUp')) {
        newIndex = findNextFocus(-1);
      } else {
        toggleSidebar();
      }
      break;
  }
  
  navItems[newIndex]?.focus();
  
  if (handleExtraKeyDown) {
    handleExtraKeyDown(evt);
  }
};

export const findFirstFocusableIndex = (options: HTMLButtonElement[] | HTMLInputElement[]) => {
  // Check whether next item is disabled or not. Keep searching next item until finding not disabled item.
  for (let i = 0; i <= options.length; i++) {
    if (!options[i]?.disabled && options[i].role !== 'presentation') {
      return i;
    }
  }
  
  // Fallback
  return 0;
};

const findLastFocusableIndex = (options: HTMLButtonElement[] | HTMLInputElement[]) => {
  // Check whether next item is disabled or not. Keep searching next item until finding not disabled item.
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i]?.disabled && options[i].role !== 'presentation') {
      return i;
    }
  }
  
  // Fallback
  return options.length - 1;
};

// Ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
type HandleTriggerKeyDownArgs = {
  evt: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  options: HTMLButtonElement[] | HTMLInputElement[],
  onOpen: () => void,
  onClose: () => void,
  handleExtraKeyDown?: (evt: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => void,
};
export const handleTriggerKeyDown = (args: HandleTriggerKeyDownArgs) => {
  const {
    evt,
    options = [],
    onOpen,
    onClose,
    handleExtraKeyDown
  } = args;
  const pressedKey = evt.key; // NOTE: store key in variable before overwritten
  
  const findFocusedIndex = () => {
    const selectedIndex = options.findIndex(item => {
      if (item instanceof HTMLButtonElement) {
        return item?.getAttribute('aria-selected') === 'true' && !item?.disabled;
      }
      return item?.checked && !item?.disabled && item?.role !== 'presentation';
    });
    if (selectedIndex !== -1) {
      return selectedIndex;
    }
    
    // If item is not selected, find the first focusable item
    return findFirstFocusableIndex(options);
  };
  
  if (pressedKey === 'Escape') {
    onClose();
  }
  
  if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(pressedKey)) {
    evt.preventDefault();
    onOpen();
    
    // Use setTimeout as it takes time to read ref on select option
    setTimeout(() => {
      let focusedIndex = 0;
      switch (pressedKey) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case ' ':
          focusedIndex = findFocusedIndex();
          break;
        case 'Home':
          focusedIndex = findFirstFocusableIndex(options);
          break;
        case 'End':
          focusedIndex = findLastFocusableIndex(options);
          break;
      }

      options[focusedIndex]?.focus();
    }, 0);
  }
  
  if (handleExtraKeyDown) {
    handleExtraKeyDown(evt);
  }
};

type HandleOptionKeyDownArgs = {
  evt: React.KeyboardEvent<HTMLElement>,
  index: number, // current index inside of options
  options: HTMLElement[],
  triggerElement: HTMLElement,
  onClose: () => void,
  onSelect?: () => void,
  handleExtraKeyDown?: (evt: React.KeyboardEvent<HTMLElement>) => void,
};
export const handleOptionKeyDown = (args: HandleOptionKeyDownArgs) => {
  const { evt, index, options = [], triggerElement, onClose, onSelect, handleExtraKeyDown } = args;
  
  const findNextFocus = (direction: 1 | -1) => {
    // check whether next item is disabled or not. Keep searching next item until finding not disabled item.
    let nextIndex = index + direction;
    
    while (nextIndex >= 0 && nextIndex < options.length) {
      if (options[nextIndex] && !options[nextIndex]?.disabled && options[nextIndex]?.role !== 'presentation') {
        return nextIndex;
      }
      nextIndex += direction;
    }
    
    // fallback
    return index;
  };
  
  if (['Enter', ' '].includes(evt.key) && onSelect) {
    evt.preventDefault();
    onSelect();
    triggerElement?.focus();
  }
  
  if (['Escape', 'Tab'].includes(evt.key)) {
    onClose();
    triggerElement?.focus();
  }
  
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(evt.key)) {
    evt.preventDefault();
    const VISIBLE_STEP = 10;
    const firstFocusableIndex = findFirstFocusableIndex(options);
    const lastFocusableIndex = findLastFocusableIndex(options);
    let focusedIndex = index;
    switch (evt.key) {
      case 'ArrowDown':
        focusedIndex = Math.min(findNextFocus(1), lastFocusableIndex);
        break;
      case 'ArrowUp':
        focusedIndex = Math.max(findNextFocus(-1), firstFocusableIndex);
        break;
      case 'Home':
        focusedIndex = firstFocusableIndex;
        break;
      case 'End':
        focusedIndex = lastFocusableIndex;
        break;
      case 'PageDown':
        focusedIndex = Math.min(index + VISIBLE_STEP, lastFocusableIndex);
        break;
      case 'PageUp':
        focusedIndex = Math.max(index - VISIBLE_STEP, firstFocusableIndex);
        break;
    }
    
    options[focusedIndex]?.focus();
  }
  
  if (handleExtraKeyDown) {
    handleExtraKeyDown(evt);
  }
};
