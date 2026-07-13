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
// MenuListContext
//

type MenuListRole = 'none' | 'presentation' | 'menu' | 'menubar' | 'listbox' | 'group';
type MenuListSelectionMode = 'single' | 'multiple';
const getDefaultOptionRole = (role: MenuListRole, selectionMode?: undefined | MenuListSelectionMode) => {
  switch (role) {
    case 'none':
    case 'presentation':
      throw new Error(`Found invalid 'option' element in presentational MenuList`);
    case 'menu':
    case 'menubar':
    case 'group': {
      switch (selectionMode) {
        case 'single': return 'menuitemradio';
        case 'multiple': return 'menuitemcheckbox';
        default: return 'menuitem';
      }
    }
    case 'listbox': return 'option';
    default: throw new Error(`Unexpected role '${role satisfies never}'`);
  }
};

/** Context used to pass component configuration from parent to items. */
type MenuListContext = { role: MenuListRole, disabled: boolean };
const MenuListContext = React.createContext<null | MenuListContext>(null);
const useMenuListContext = (): MenuListContext => {
  const context = React.use(MenuListContext);
  if (context === null) { throw new Error(`Missing MenuListContext`); }
  return context;
};


//
// Grouping components
//

type MenuListSegmentProps = ComponentProps<'section'> & {
  /** Whether this component should be unstyled. Default: `false`. */
  unstyled?: undefined | boolean,
  
  /** Whether the items in this segment are disabled or not. Default: inherit from context. */
  disabled?: undefined | boolean,
  
  /** Whether the item should stick on scroll. Default: `false`. */
  sticky?: undefined | false | 'start' | 'end',
};
/**
 * A generic container of items. Unlike `Group`, does not have a `role`, an accessible name, or visible heading.
 * Can be used to apply an effect to a group of items, for example sticky positioning.
 */
export const MenuListSegment = ({ unstyled, disabled, sticky = false, ...propsRest }: MenuListSegmentProps) => {
  const context = useMenuListContext();
  const isDisabled = disabled ?? context.disabled;
  
  const contextSegment = React.useMemo<MenuListContext>(() => ({
    ...context,
    disabled: isDisabled,
  }), [context, isDisabled]);
  
  return (
    <MenuListContext value={contextSegment}>
      <section
        //role="presentation" // Already the default
        {...propsRest}
        aria-disabled={isDisabled ? 'true' : 'false'}
        className={cx(
          { [cl['bk-menu-list__segment']]: !unstyled },
          { [cl['bk-menu-list__sticky--start']]: sticky === 'start' },
          { [cl['bk-menu-list__sticky--end']]: sticky === 'end' },
          propsRest.className,
        )}
      />
    </MenuListContext>
  );
};

type MenuListFooterProps = React.ComponentProps<typeof MenuListSegment>;
/**
 * A segment to display as a footer. Will be sticky (at end) by default, and will be shown below all other UI including
 * automatically-added elements like the empty placeholder or the loading indicator.
 */
export const MenuListFooter = (props: MenuListFooterProps) => {
  return (
    <MenuListSegment sticky="end" {...props} className={cx(cl['bk-menu-list__footer'], props.className)}/>
  );
};

export type MenuListGroupProps = Omit<MenuListSegmentProps, 'sticky'> & {
  /**
   * An accessible name for this group. Required. Can be set to `null` if the label is provided through implicit means,
   * or if an `aria-labelledby` is used instead.
   */
  label: null | string,
  
  /** A heading to display. Optional. If not defined, the `label` will be displayed. */
  heading?: undefined | React.ReactNode,
  
  /** Whether the heading should be sticky when scrolling. Default: `true`. */
  stickyHeading?: undefined | boolean,
  
  /** Additional props to pass to the group heading element. */
  headingProps?: undefined | React.ComponentProps<typeof H6>,
};
/**
 * A group element, can contain menu items and/or other groups.
 */
export const MenuListGroup = (props: MenuListGroupProps) => {
  const { unstyled, label, heading, stickyHeading = true, headingProps = {}, ...propsRest } = props;
  
  const headingContent = heading ?? (label !== null ? label : null);
  
  const id = React.useId();
  const headingId = headingProps.id ?? `${id}-heading`;
  const ariaProps = {
    'aria-labelledby': headingContent ? headingId : undefined,
  };
  
  return (
    <MenuListSegment
      unstyled={unstyled}
      role="group"
      {...mergeProps(ariaProps, propsRest)}
      sticky={false}
    >
      {headingContent !== null &&
        <H6 unstyled // FIXME: hardcoded level 6 heading, would be better if this level is dynamic (see ticket #160)
          id={headingId}
          {...headingProps}
          className={cx(
            cl['bk-menu-list__item'],
            cl['bk-menu-list__item--heading'],
            { [cl['bk-menu-list__sticky--start']]: stickyHeading },
            headingProps.className,
          )}
        >
          <span className={cx(cl['bk-menu-list__item__label'])}>{headingContent}</span>
        </H6>
      }
      
      {propsRest.children}
    </MenuListSegment>
  );
};


//
// Item components
//

type MenuListItemStaticProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. Default: `false`. */
  unstyled?: undefined | boolean,
  
  /** Whether to display the static text as muted. Default: `false`. */
  muted?: undefined | boolean,
};
/**
 * A static item, that can be customized for any presentational content (not affected by store state).
 */
export const MenuListItemStatic = ({ unstyled, muted, ...propsRest }: MenuListItemStaticProps) => (
  <div
    //role="presentation" // Already the default
    // @ts-ignore
    focusgroup="none" // Exclude static items (and any focusable items within) from the focus group
    {...propsRest}
    className={cx(
      { [cl['bk-menu-list__item']]: !unstyled },
      cl['bk-menu-list__item--static'],
      { [cl['bk-menu-list__item--muted']]: muted },
      propsRest.className,
    )}
  />
);

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

type MenuListItemOptionProps = Omit<ComponentProps<typeof Button>, 'kind' | 'variant' | 'onSelect' | 'icon'> & {
  /** Whether to display this as a radio option (single select) or a checkbox option (multiple select). */
  selectionMode: MenuListSelectionMode,
  
  /** Whether this element is currently selected. */
  selected?: undefined | boolean,
  
  /** A callback that is triggeed when the user requests this option to be selected. */
  onRequestSelected?: undefined | (() => void),
  
  icon?: undefined | IconName | ((props: Partial<React.ComponentProps<typeof BkIcon>>) => React.ReactNode),
  
  /** Additional props to pass to the icon. */
  iconProps?: undefined | Partial<React.ComponentProps<typeof BkIcon>>,
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
    selectionMode,
    selected = false,
    onRequestSelected,
    icon,
    iconProps,
    ...propsRest
  } = props;
  
  const context = useMenuListContext();
  
  const isDisabled = disabled || nonactive || context.disabled;
  const handlePress = React.useCallback(() => {
    if (isDisabled) { return; }
    if (selectionMode === 'single' && selected) { return; }
    onRequestSelected?.();
  }, [isDisabled, selectionMode, selected, onRequestSelected]);
  
  const optionRole = getDefaultOptionRole(context.role, selectionMode);
  
  // For the "selected state" aria prop, use either `aria-selected` or `aria-checked`, depending on the role
  const ariaSelectedProp = optionRole === 'option' ? 'aria-selected' : 'aria-checked';
  
  const renderIcon = () => {
    const propsIcon = mergeProps(iconProps, { className: cl['bk-menu-list__item__icon'] });
    if (typeof icon === 'string') { return <BkIcon icon={icon} {...propsIcon}/>; }
    if (typeof icon === 'function') { return icon(propsIcon); }
    return null;
  };
  
  return (
    <Button
      variant="basic"
      wrap={false}
      role={optionRole}
      {...{ [ariaSelectedProp]: selected || undefined }}
      data-multiselect={selectionMode === 'multiple' ? 'true' : 'false'}
      aria-disabled={isDisabled || undefined}
      {...mergeProps(
        {
          onPress: handlePress,
        },
        propsRest,
        {
          className: cx(
            { [cl['bk-menu-list__item']]: !unstyled },
            cl['bk-menu-list__item--interactive'],
            cl['bk-menu-list__item--option'],
            className,
          ),
        },
      )}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isDisabled}
    >
      <span className={cx(cl['bk-menu-list__item__label'])}>
        {renderIcon()}
        
        {selectionMode === 'multiple' &&
          <Checkbox role="presentation" tabIndex={-1} checked={selected} disabled={isDisabled}
            className={cx(cl['bk-menu-list__item__checkbox'])}
          />
        }
        {propsRest.children ?? propsRest.label}
      </span>
    </Button>
  );
};

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

export const PlaceholderEmpty = (props: ComponentProps<'div'>) => (
  <div
    role={getDefaultOptionRole(useMenuListContext().role)}
    tabIndex={-1}
    aria-disabled="true"
    {...props}
    className={cx(
      cl['bk-menu-list__item'],
      cl['bk-menu-list__placeholder-empty'],
      props.className,
    )}
  />
);

export const PlaceholderLoading = (props: ComponentProps<'span'>) => (
  <span
    {...props}
    className={cx(
      cl['bk-menu-list__item'],
      cl['bk-menu-list__placeholder-loading'],
      props.className,
    )}
  >
    Loading... <Spinner inline size="small"/>
  </span>
);

export type MenuListProps = Omit<ComponentProps<'div'>, 'role' | 'onSelect' | 'defaultValue' | 'defaultChecked'> & {
  /** Whether this component should be unstyled. Default: `false`. */
  unstyled?: undefined | boolean,
  
  /** The semantic role for this menu. Default: `"menu"`. */
  role?: undefined | MenuListRole,
  
  /**
   * An accessible name for this menu list. Required. Can be set to `null` if the label is provided through implicit
   * means, or if an `aria-labelledby` is used instead.
  */
  label: null | string,
  
  /** The orientation of the menu list, either block or inline. Default: `"block"`. */
  orientation?: undefined | 'inline' | 'block',
  
  /** The (inline) size of the menu list. Default: `medium`. */
  size?: undefined | 'shrink' | 'small' | 'medium' | 'large',
  
  /** Whether this component is meant to be embedded in another component. Default: `false`. */
  embedded?: undefined | boolean,
  
  /** Whether the menu list is disabled or not. Default: `false`. */
  disabled?: undefined | boolean,
  
  /** The current status of the menu list. Default: `ready`. */
  status?: undefined | 'ready' | 'loading',
  
  /** Whether the menu is considered empty (no items). When empty, the `placeholderEmpty` is shown. Default: `false`. */
  empty?: undefined | boolean,
  
  /** A placeholder message to display when there are no items in the list. Set to `null` to prevent showing at all. */
  placeholderEmpty?: undefined | React.ReactNode,
};
/**
 * A menu list is a composite component, presenting a list of choices to the user. Each choice corresponds to a menu
 * item, which can be an action button, a selectable option, a link, etc. Items may be grouped together.
 * 
 * `MenuList` is a presentational-only component, and does not come with any built-in state management. Other
 * components like `ListBox` and `Menu` build on top of this component to add state management.
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
      embedded = false,
      disabled = false,
      status = 'ready',
      empty = false,
      placeholderEmpty = 'No items available',
      ...propsRest
    } = props;
    
    const scrollerProps = useScroller();
    const focusGroupProps = useFocusGroup({ focusGroup: `${role} ${orientation} nowrap` });
    const isFocusGroup = ['menu', 'menubar', 'listbox'].includes(role);
    
    const isEmpty = empty || !children;
    const isLoading = status === 'loading';
    
    const context = React.useMemo<MenuListContext>(() => ({ role, disabled }), [role, disabled]);
    
    return (
      <MenuListContext value={context}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: False positive, `aria-label` is supported for `role` */}
        <div
          role={role}
          aria-label={typeof label === 'string' ? label : undefined}
          aria-busy={isLoading ? 'true' : undefined}
          aria-orientation={orientation === 'block' ? 'vertical' : 'horizontal'} // Take into account `writing-mode`?
          {...mergeProps(
            !embedded ? scrollerProps : {},
            isFocusGroup ? focusGroupProps : {},
            {
              className: cx(
                'bk',
                { [cl['bk-menu-list']]: !unstyled },
                { [cl['bk-menu-list--embedded']]: embedded },
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
            <PlaceholderEmpty role={getDefaultOptionRole(role)}>{placeholderEmpty}</PlaceholderEmpty>
          }
          
          {isLoading && <PlaceholderLoading/>}
        </div>
      </MenuListContext>
    );
  },
  {
    Segment: MenuListSegment,
    Footer: MenuListFooter,
    Group: MenuListGroup,
    Static: MenuListItemStatic,
    Action: MenuListItemAction,
    Option: MenuListItemOption,
    Link: MenuListItemLink,
  },
);
