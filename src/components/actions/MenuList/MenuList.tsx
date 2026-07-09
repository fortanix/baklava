/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';
import { useFocusGroup } from '../../../util/hooks/useFocusGroup.ts';

import { H6 } from '../../../typography/Heading/Heading.tsx';
import { type IconName, type IconDecoration, Icon as BkIcon } from '../../graphics/Icon/Icon.tsx';
import { Spinner } from '../../graphics/Spinner/Spinner.tsx';
import { Checkbox } from '../../forms/controls/Checkbox/Checkbox.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { LinkAsButton } from '../LinkAsButton/LinkAsButton.tsx';

import cl from './MenuList.module.scss';


/*
References:
- https://open-ui.org/components/menu.explainer/#the-menulist-element
*/

export { cl as MenuListClassNames };


//
// MenuListContext: used to pass component configuration from parent to items.
//

type MenuListRole = 'menu' | 'listbox';
type MenuListSelectionType = 'radio' | 'checkbox';
const getDefaultOptionRole = (role: MenuListRole, selectionType?: undefined | MenuListSelectionType) => {
  switch (role) {
    case 'menu': {
      switch (selectionType) {
        case 'radio': return 'menuitemradio';
        case 'checkbox': return 'menuitemcheckbox';
        default: return 'menuitem';
      }
    }
    case 'listbox': return 'option';
    default: throw new Error(`Unexpected role '${role satisfies never}'`);
  }
};

type MenuListContext = { role: MenuListRole, disabled: boolean };
const MenuListContext = React.createContext<null | MenuListContext>(null);
const useMenuListContext = (): MenuListContext => {
  const context = React.use(MenuListContext);
  if (context === null) { throw new Error(`Missing MenuListContext`); }
  return context;
};


//
// Grouping elements
//

export type MenuListGroupProps = ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /**
   * An accessible name for this group. Required. Can be set to `null` if the label is provided through implicit means,
   * or if an `aria-labelledby` is used instead.
   */
  label: null | string,
  
  /** A heading to display. Optional. If not defined, the `label` will be displayed. */
  heading?: undefined | React.ReactNode,
  
  /** Whether the action should stick on scroll. Default: 'start'. */
  sticky?: undefined | false | 'start',
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** Custom icon component. */
  Icon?: undefined | MenuListIcon,
};
/**
 * A group element that can contain list options or other groups.
 */
export const MenuListGroup = (props: MenuListGroupProps) => {
  const { unstyled, label, heading, icon, sticky = 'start', Icon = BkIcon, ...propsRest } = props;
  
  const id = React.useId();
  const ariaProps = {
    'aria-label': heading === null ? label : undefined,
    'aria-labelledby': heading === null ? undefined : `${id}-heading`,
  };
  
  const headingContent = heading ?? (label !== null ? label : null);
  
  return (
    // biome-ignore lint/a11y/useSemanticElements: Using `role="group"` instead of `<fieldset>`, it's not a form field
    <section
      role="group"
      {...mergeProps(ariaProps, propsRest)}
      className={cx(
        { [cl['bk-menu-list__group']]: !unstyled },
        propsRest.className,
      )}
    >
      {headingContent !== null &&
        <H6 unstyled // FIXME: hardcoded level 6 heading
          id={`${id}-heading`}
          className={cx(
            cl['bk-menu-list__item'],
            cl['bk-menu-list__item--heading'],
          )}
        >
          {icon && <Icon icon={icon} className={cl['bk-menu-list__item__icon']}/>}
          {headingContent}
        </H6>
      }
      
      {propsRest.children}
    </section>
  );
};

type MenuListSegmentProps = ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the item should stick on scroll. Default: `false`. */
  sticky?: undefined | 'start' | 'end',
};
/**
 * A visual-only container of items. Unlike `Group`, does not have any semantics, an accessible name, or visible
 * heading. Can be used to apply an effect to a group of items, for example sticky positioning.
 */
export const MenuListSegment = ({ unstyled, sticky, ...propsRest }: MenuListSegmentProps) => (
  <section
    //role="presentation" // Already the default
    {...propsRest}
    className={cx(
      { [cl['bk-menu-list__group']]: !unstyled },
      { [cl['bk-menu-list__group--sticky']]: typeof sticky === 'string' },
      { [cl['bk-menu-list__group--sticky-start']]: sticky === 'start' },
      { [cl['bk-menu-list__group--sticky-end']]: sticky === 'end' },
      propsRest.className,
    )}
  />
);


//
// Static item
//

type MenuListItemStaticProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether to display the static text as muted. Default: `false`. */
  muted?: undefined | boolean,
};
/**
 * A static item, that can be customized for any presentational content (not affected by store state).
 * 
 * Important: since this is inside a `role="menulist"`, the static content should be presentational only. There should
 * be no interactive elements or other semantic content, only presentational content.
 */
export const MenuListItemStatic = ({ unstyled, muted, ...propsRest }: MenuListItemStaticProps) => (
  <div
    //role="presentation" // Already the default
    {...propsRest}
    className={cx(
      { [cl['bk-menu-list__item']]: !unstyled },
      cl['bk-menu-list__item--static'],
      { [cl['bk-menu-list__item--muted']]: muted },
      propsRest.className,
    )}
  />
);


//
// MenuListItemAction
//

type MenuListItemActionProps = Omit<ComponentProps<typeof Button>, 'kind' | 'variant' | 'onSelect'> & {
  /** How to decorate the icon. Default: undefined (i.e. no decoration). */
  iconDecoration?: undefined | 'highlight',
};
/**
 * A menu list action.
 */
export const MenuListItemAction = (props: MenuListItemActionProps) => {
  const {
    unstyled,
    className,
    disabled,
    nonactive,
    iconDecoration,
    ...propsRest
  } = props;
  
  const context = useMenuListContext();
  
  const isDisabled = disabled || nonactive || context.disabled;
  
  const iconProps = React.useMemo<undefined | { decoration: IconDecoration }>(() => {
    if (iconDecoration === 'highlight') {
      return { decoration: { type: 'background-circle' } };
    }
  }, [iconDecoration]);
  
  const optionRole = getDefaultOptionRole(context.role);
  
  if (context.role !== 'menu') { throw new Error(`Cannot render an arbitrary action inside a listbox`); }
  
  return (
    <Button
      variant="basic"
      kind="tertiary"
      wrap={false}
      role={optionRole}
      aria-disabled={isDisabled || undefined}
      {...mergeProps(
        {
          iconProps,
        },
        propsRest,
        {
          className: cx(
            { [cl['bk-menu-list__item']]: !unstyled },
            cl['bk-menu-list__item--interactive'],
            cl['bk-menu-list__item--action'],
            { [cl['bk-menu-list__item--icon-highlight']]: iconDecoration === 'highlight' },
            className,
          ),
        },
      )}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isDisabled}
    />
  );
};


//
// MenuListItemOption
//

type MenuListItemOptionProps = Omit<ComponentProps<typeof Button>, 'kind' | 'variant' | 'onSelect'> & {
  /** Whether to display this as a radio option (single select) or a checkbox option (multiple select). */
  selectionType: MenuListSelectionType,
  
  /** Whether this element is currently selected. */
  selected?: undefined | boolean,
  
  /** A callback that is triggeed when the user requests this option to be selected. */
  onRequestSelected?: undefined | (() => void),
  
  /** How to decorate the icon. Default: undefined (i.e. no decoration). */
  iconDecoration?: undefined | 'highlight',
};
/**
 * A menu list option (which can be selected by the user).
 */
export const MenuListItemOption = (props: MenuListItemOptionProps) => {
  const {
    unstyled,
    className,
    disabled,
    nonactive,
    selectionType,
    selected = false,
    onRequestSelected,
    iconDecoration,
    ...propsRest
  } = props;
  
  const context = useMenuListContext();
  
  const isDisabled = disabled || nonactive || context.disabled;
  const handlePress = React.useCallback(() => {
    if (isDisabled) { return; }
    if (selectionType === 'radio' && selected) { return; }
    onRequestSelected?.();
  }, [isDisabled, selectionType, selected, onRequestSelected]);
  
  const iconProps = React.useMemo<undefined | { decoration: IconDecoration }>(() => {
    if (iconDecoration === 'highlight') {
      return { decoration: { type: 'background-circle' } };
    }
  }, [iconDecoration]);
  
  const optionRole = getDefaultOptionRole(context.role, selectionType);
  
  // For the "selected state" aria prop, use either `aria-selected` or `aria-checked`, depending on the role
  const ariaSelectedProp = optionRole === 'option' ? 'aria-selected' : 'aria-checked';
  
  return (
    <Button
      variant="basic"
      wrap={false}
      role={optionRole}
      {...{ [ariaSelectedProp]: selected || undefined }}
      data-multiselect={selectionType === 'checkbox' ? 'true' : 'false'}
      aria-disabled={isDisabled || undefined}
      {...mergeProps(
        {
          onPress: handlePress,
          iconProps,
        },
        propsRest,
        {
          className: cx(
            { [cl['bk-menu-list__item']]: !unstyled },
            cl['bk-menu-list__item--interactive'],
            cl['bk-menu-list__item--option'],
            { [cl['bk-menu-list__item--icon-highlight']]: iconDecoration === 'highlight' },
            className,
          ),
        },
      )}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isDisabled}
    >
      {selectionType === 'checkbox' &&
        <Checkbox checked={selected} tabIndex={-1} className={cx(cl['bk-menu-list__item__checkbox'])}/>
      }
      {propsRest.children ?? propsRest.label}
    </Button>
  );
};


//
// MenuListItemLink
//

type MenuListItemLinkProps = Omit<ComponentProps<typeof LinkAsButton>, 'kind'>;
/**
 * A menu list option (which can be selected by the user).
 */
export const MenuListItemLink = (props: MenuListItemLinkProps) => {
  const {
    unstyled,
    className,
    disabled,
    nonactive,
    ...propsRest
  } = props;
  
  const context = useMenuListContext();
  
  const isDisabled = disabled || nonactive || context.disabled;
  const optionRole = getDefaultOptionRole(context.role);
  return (
    <LinkAsButton
      variant="basic"
      wrap={false}
      role={optionRole}
      aria-disabled={isDisabled}
      {...mergeProps(
        propsRest,
        {
          className: cx(
            { [cl['bk-menu-list__item']]: !unstyled },
            cl['bk-menu-list__item--link'],
            cl['bk-menu-list__item--interactive'],
            className,
          ),
        },
      )}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isDisabled}
    />
  );
};


//
// Menu list
//

export type MenuListProps = Omit<ComponentProps<'div'>, 'role' | 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The role for this menu. Currently, only `menu` and `listbox` are supported. Default: `"menu"`. */
  role?: undefined | MenuListRole,
  
  /**
   * An accessible name for this menu list. Required. Can be set to `null` if the label is provided through implicit
   * means, or if an `aria-labelledby` is used instead.
  */
  label: null | string,
  
  /** The orientation of the menu list, either block or inline. Default: `"block"`. */
  orientation?: undefined | 'inline' | 'block',
  
  /** The (inline) size of the menu list. Optional. Default: `medium`. */
  size?: undefined | 'shrink' | 'small' | 'medium' | 'large',
  
  /** Whether the menu list is disabled or not. Default: `false`. */
  disabled?: undefined | boolean,
  
  /** The current status of the menu list. Default: `ready`. */
  status?: undefined | 'ready' | 'loading',
  
  /** Whether the menu is considered empty (no items). When empty, the `placeholderEmpty` is shown. Default: `false`. */
  empty?: undefined | boolean,
  
  /** A placeholder message to display when there are no items in the list. Set to `null` to prevent showing at all. */
  placeholderEmpty?: undefined | React.ReactNode,
};

export const PlaceholderEmpty = (props: React.ComponentProps<'div'>) => (
  <div
    role={getDefaultOptionRole(useMenuListContext().role)}
    tabIndex={-1}
    aria-disabled="true"
    {...props}
    className={cx(
      cl['bk-menu-list__item'],
      cl['bk-menu-list__empty-placeholder'],
      props.className,
    )}
  />
);

export const PlaceholderLoading = (props: React.ComponentProps<'span'>) => (
  <span
    {...props}
    className={cx(
      cl['bk-menu-list__item'],
      cl['bk-menu-list__item--loading'],
      props.className,
    )}
  >
    Loading... <Spinner inline size="small"/>
  </span>
);

/**
 * A menu list is a composite component, presenting a list of choices to the user. Each choice corresponds to a menu
 * item, which can be an action button, a selectable option, a link, etc. Items may be grouped together.
 * 
 * The `MenuList` component does not come with any built-in state management, it is visual only. Other components like
 * `ListBox` and `Menu` build on top of this component.
 * 
 * @see {@link https://w3c.github.io/aria/#menu}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role}
 */
export const MenuList = Object.assign(
  (props: MenuListProps) => {
    const {
      children,
      unstyled = false,
      role = 'menu',
      label,
      orientation = 'block',
      size = 'medium',
      disabled = false,
      status = 'ready',
      empty = false,
      placeholderEmpty = 'No items available',
      footer,
      ...propsRest
    } = props;
    
    const scrollerProps = useScroller();
    const focusGroupProps = useFocusGroup({ focusGroup: `${role} ${orientation} nowrap` });
    
    const isEmpty = empty || !children;
    const isLoading = status === 'loading';
    
    const context = React.useMemo(() => ({ role, disabled }), [role, disabled]);
    
    const placeholderItemRole = getDefaultOptionRole(role);
    
    return (
      <MenuListContext value={context}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: `aria-label` is supported on `role="menu"`. */}
        <div
          role={role}
          aria-label={typeof label === 'string' ? label : undefined}
          aria-busy={isLoading}
          {...mergeProps(
            scrollerProps,
            focusGroupProps,
            {
              className: cx(
                'bk',
                { [cl['bk-menu-list']]: !unstyled },
                { [cl['bk-menu-list--empty']]: isEmpty },
                { [cl['bk-menu-list--size-shrink']]: size === 'shrink' },
                { [cl['bk-menu-list--size-small']]: size === 'small' },
                { [cl['bk-menu-list--size-medium']]: size === 'medium' },
                { [cl['bk-menu-list--size-large']]: size === 'large' },
              ),
            },
            propsRest,
          )}
        >
          {children}
          
          {/*
            As per the "Required Owned Elements" rule, there must be at least one item. When the menu is empty, we will
            add a disabled placeholder item.
            https://www.w3.org/TR/wai-aria-1.1/#mustContain
            https://github.com/dequelabs/axe-core/issues/383
            https://github.com/dequelabs/axe-core/issues/2339
          */}
          {isEmpty && placeholderEmpty && status === 'ready' &&
            <PlaceholderEmpty role={placeholderItemRole}>{placeholderEmpty}</PlaceholderEmpty>
          }
          
          {isLoading && <PlaceholderLoading/>}
        </div>
      </MenuListContext>
    );
  },
  {
    Group: MenuListGroup,
    Segment: MenuListSegment,
    Static: MenuListItemStatic,
    Action: MenuListItemAction,
    Option: MenuListItemOption,
    Link: MenuListItemLink,
  },
);
