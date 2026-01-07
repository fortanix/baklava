/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Tabs.module.scss';


export { cl as TabsClassNames };

export type TabKey = string;

export type TabProps = ComponentProps<'div'> & {
  /** A unique identifier for this tab. */
  tabKey: string,
  /** The contents of the tab, when active. */
  children?: undefined | React.ReactNode,
  /** A render prop to render the tab. Overrides `children`, if set. */
  render?: undefined | (() => React.ReactNode),
  /** The title of this tab, to be shown in the tab trigger button. */
  title: React.ReactNode,
  /** Whether to hide this tab. If true, the tab trigger is not rendered at all. */
  hide?: undefined | boolean,
  /** A class name to set on the tab trigger button. */
  className?: undefined | ClassNameArgument,
  /** A class name to set on the tab panel content. */
  contentClassName?: undefined | ClassNameArgument,
  /** Any additional props to pass to the tab trigger button. */
  tabTriggerProps?: undefined | (ComponentProps<'li'> & { 'data-label': string }),
};
export const Tab = ({ children }: TabProps): React.ReactElement => {
  return children as React.ReactElement;
};
type TabElement = React.ReactElement<TabProps, React.FunctionComponent<typeof Tab>>;

export type TabsProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Active key of tab. */
  activeKey?: undefined | string,
  
  /** Callback executed when active tab is changed. */
  onSwitch: (tabKey: TabKey) => void,
};
/**
 * A tab component
 */
export const Tabs = (props: TabsProps) => {
  const { unstyled = false, activeKey, children, onSwitch, ...propsRest } = props;
  
  // Select the activeKey tab among the given list of tabs
  const getActiveTab = (tabs: Array<TabElement>) => {
    const activeTabs = tabs.filter(child => child.props.tabKey === activeKey);
    
    if (activeTabs.length === 0) { return null; }
    if (activeTabs.length > 1) { throw new TypeError(`Ambiguous active tab`); }
    
    return activeTabs[0];
  };
  
  type ActiveTabProps = Omit<TabProps, 'children' | 'tabKey' | 'title' | 'hide' | 'render'>;
  const getActiveTabProps = (tab: TabElement): ActiveTabProps => {
    const { children, tabKey, title, hide, render, tabTriggerProps, ...tabProps } = tab.props;
    return tabProps;
  };
  
  const renderActive = (tab: TabElement) => {
    let tabElement: React.ReactNode;
    if (typeof tab.props.render === 'function') {
      tabElement = tab.props.render();
    } else {
      tabElement = tab.props.children;
    }
    
    return tabElement;
  };
  
  // FIXME: this throws an error in Chromatic, since `child.type` is `undefined`
  // React.Children.forEach(children, (child: React.ReactNode) => {
  //   if (!React.isValidElement(child) || child?.type?.name !== 'Tab') {
  //     throw new TypeError(`Expected only children of type Tab, received ${child}: ${JSON.stringify(child?.type)}`);
  //   }
  // });
  
  const tabs = React.Children.toArray(children) as Array<TabElement>;
  const activeTab = getActiveTab(tabs);
  const activeTabProps: null | ActiveTabProps = (activeTab && getActiveTabProps(activeTab)) ?? null;
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-tabs']]: !unstyled },
        propsRest.className,
      )}
    >
      <ul className={cx(cl['bk-tabs__switcher'])} role="tablist">
        {tabs.map(tab => {
          const { tabKey, hide, tabTriggerProps } = tab.props;
          
          if (hide) { return null; }
          
          const isActive = tabKey === activeKey;
          
          return (
            <li
              key={tabKey}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              data-tab={tabKey}
              {...tabTriggerProps}
              className={cx(cl['bk-tabs__switcher__tab'], tabTriggerProps?.className)}
              onClick={() => { onSwitch(tab.props.tabKey); }} // FIXME: add a Button and use that instead
            >
              <span>{tab.props.title}</span>
              {/* Hidden duplicated title, used to prevent layout shifts on hover. */}
              <span aria-hidden className={cx(cl['bk-tabs__switcher__tab__hover-placeholder'])}>{tab.props.title}</span>
            </li>
          );
        })}
      </ul>
      
      {activeTab &&
        <div
          role="tabpanel"
          {...(activeTabProps ?? {})}
          className={cx(
            cl['bk-tabs__tab-content'],
            activeTabProps?.contentClassName,
            activeTabProps?.className
          )}
        >
          {renderActive(activeTab)}
        </div>
      }
    </div>
  );
};
