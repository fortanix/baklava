/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type IconName, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import cl from './DropdownMenu.module.scss';


/*
References:
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
*/

export { cl as DropdownMenuClassNames };

export type OptionKey = string;
export type OptionDef = { optionKey: OptionKey, label: string };

export type OptionState = { option: OptionDef, selected: boolean };
export type DropdownMenuContext = {
  // Additional props to pass to the option
  optionProps?: undefined | ((optionState: OptionState) => Record<string, unknown>),
  
  selectedOption: null | OptionKey, // The key of the currently selected option (if any)
  selectOption: (option: OptionDef) => void, // Select the given option
  
  close: () => void, // Request dropdown menu close
};
export const DropdownMenuContext = React.createContext<null | DropdownMenuContext>(null);
export const useDropdownMenuContext = (): DropdownMenuContext => {
  const context = React.use(DropdownMenuContext);
  if (context === null) { throw new Error(`Missing DropdownMenuContext provider`); }
  return context;
};


export type ActionProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** A unique identifier for this action. */
  itemKey: OptionKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** The icon to be displayed (if any). */
  icon?: undefined | IconName,
  
  /** The event handler for when the user activates this action. */
  onActivate: (context: DropdownMenuContext) => void | Promise<void>,
}>;
/**
 * A dropdown menu item that can be triggered to perform some action.
 */
export const Action = (props: ActionProps) => {
  const { itemKey, label, icon, onActivate, ...propsRest } = props;
  
  const context = useDropdownMenuContext();
  const { optionProps, selectedOption } = context;
  
  const option: OptionDef = { optionKey: itemKey, label };
  const isSelected = selectedOption === itemKey;
  
  return (
    <li aria-selected={isSelected}>
      <Button unstyled
        // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<option>` for this.
        role="option"
        //tabIndex={-1} // Only the `role="listbox"` should be focusable, use keyboard arrows to select the option
        data-option-key={itemKey}
        {...propsRest}
        {...optionProps?.({
          option,
          selected: false,
        })}
        // FIXME: merge these props with `optionProps()`
        className={cx(
          cl['bk-dropdown-menu__item'],
          propsRest.className,
        )}
        onPress={() => {
          const result = onActivate(context);
          if (result instanceof Promise) {
            // TODO: allow some way for the `Promise` result to signal that it wants to opt out of auto close?
            result.then(
              () => { context.close(); },
              reason => {
                // Keep open
                console.warn(`Error during dropdown menu onPress callback:`, reason);
              },
            );
          } else {
            context.close();
          }
        }}
      >
        {icon && <Icon icon={icon}/>}
        {propsRest.children ?? label}
      </Button>
    </li>
  );
};


export type OptionProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  optionKey: OptionKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** The icon to be displayed (if any) */
  icon?: undefined | IconName,
  
  /** A callback to be called when the option is selected. */
  onSelect?: undefined | (() => void),
}>;
/**
 * A dropdown menu item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { optionKey, label, icon, onSelect, ...propsRest } = props;
  const { selectedOption, selectOption, optionProps } = useDropdownMenuContext();
  
  const option: OptionDef = { optionKey, label };
  const isSelected = selectedOption === optionKey;
  
  return (
    <li role="presentation">
      <Button unstyled
        // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<option>` for this.
        role="option"
        //tabIndex={-1} // Only the `role="listbox"` should be focusable, use keyboard arrows to select the option
        data-option-key={optionKey}
        aria-selected={isSelected}
        {...propsRest}
        {...optionProps?.({
          option,
          selected: isSelected,
        })}
        // FIXME: merge these props with `optionProps()`
        className={cx(
          cl['bk-dropdown-menu__item'],
          propsRest.className,
        )}
        onPress={() => { selectOption(option); onSelect?.(); }}
      >
        {icon && <Icon icon={icon} className={cl['bk-dropdown-menu__item__icon']}/>}
        <span className={cl['bk-dropdown-menu__item__label']}>{propsRest.children ?? label}</span>
      </Button>
    </li>
  );
};

export type DropdownMenuProps = ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this dropdown menu. Required. */
  label: string,
};
/**
 * Dropdown menu with a list of selectable options.
 */
export const DropdownMenu = Object.assign(
  (props: DropdownMenuProps) => {
    const { children, unstyled = false, label, ...propsRest } = props;
    
    // FIXME: need to implement keyboard arrow (up/down) navigation through items, as per:
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
    return (
      <ul
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Explicitly using `<ul>` as interactive.
        // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<select>` for this purpose.
        role="listbox"
        aria-label={label}
        tabIndex={0}
        {...propsRest}
        //onKeyDown={handleKeyInput} // FIXME
        className={cx(
          'bk',
          { [cl['bk-dropdown-menu']]: !unstyled },
          propsRest.className,
        )}
      >
        {children}
      </ul>
    );
  },
  { Action, Option },
);
