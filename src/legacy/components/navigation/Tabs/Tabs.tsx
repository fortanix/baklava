/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $msg from 'message-tag';

import * as React from 'react';
import * as ReactIs from 'react-is';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { handleTabKeyDown } from '../../../util/keyboardHandlers.tsx';

import { useScroller } from '../../util/Scroller.tsx';
import { Button } from '../../buttons/Button.tsx';

import './Tabs.scss';


export type TabKey = string;

export type TabProps = ComponentProps<'div'> & {
  children?: undefined | React.ReactNode,
  render?: undefined | (() => React.ReactNode),
  tabKey: TabKey,
  title: React.ReactNode,
  hide?: undefined | boolean,
};
export const Tab = ({ children }: TabProps) => children;
type TabElement = React.ReactElement<TabProps, React.FunctionComponent<typeof Tab>>;


export type TabsProps = ComponentProps<'div'> & {
  children: React.ReactNode,
  active: TabKey,
  onSwitch: (tabKey: TabKey) => void,
};
export const Tabs = (props: TabsProps) => {
  const {
    children,
    className,
    active,
    onSwitch,
    ...propsRest
  } = props;

  const tabsRef = React.useRef<HTMLButtonElement[]>([]);
  
  const scrollerProps = useScroller();
  // Select the active tab among the given list of tabs
  const getActiveTab = (tabs: Array<TabElement>) => {
    const activeTabs = tabs.filter(child => child.props.tabKey === active);
    if (activeTabs.length > 1) { throw new TypeError($msg`Ambiguous active tab`); }
    
    const activeTab = activeTabs[0];
    if (typeof activeTab === 'undefined') { throw new TypeError($msg`Active tab not found: ${active}`); }
    
    return activeTab;
  };
  
  const getActiveTabProps = (tab: TabElement) => {
    const { children, tabKey, title, hide, render, ...tabProps } = tab.props;
    return tabProps;
  };
  
  const renderActive = (tab: TabElement) => {
    return typeof tab.props.render === 'function' ? tab.props.render() : tab.props.children;
  };
  
  React.Children.forEach(children, child => {
    if (!ReactIs.isElement(child) || child.type !== Tab) {
      throw new TypeError(
        $msg`Expected only children of type Tab, received ${child}`,
      );
    }
  });
  
  const tabs = React.Children.toArray(children) as Array<TabElement>;
  const activeTab = getActiveTab(tabs);
  const activeTabProps = getActiveTabProps(activeTab);
  
  if (typeof active !== 'string') {
    console.error($msg`Missing active tab, given ${active}`);
    return null;
  }
  
  return (
    <div {...propsRest} role="tablist" className={cx('bkl bkl-tabs', className)}>
      <ul className="bkl-tabs__switcher">
        {tabs.map((tab, index) => {
          const { hide, tabKey, className, title } = tab.props;
          if (hide) { return null; }
          const isActive = tabKey === active;
          return (
            <li key={tabKey} role="presentation">
              <Button
                plain
                ref={element => {
                  if (element) {
                    tabsRef.current[index] = element;
                  }
                }}
                id={tabKey}
                role="tab"
                data-tab={tabKey}
                aria-selected={isActive}
                aria-controls={`${tabKey}-panel`}
                tabIndex={isActive ? 0 : -1}
                className={cx('bkl-tabs__switcher__tab', className, { 'active': isActive })}
                onClick={() => { onSwitch(tabKey); }}
                onKeyDown={(evt: React.KeyboardEvent<HTMLButtonElement>) => {
                  handleTabKeyDown({ evt, index, tabs: tabsRef.current });
                }}
              >
                {title}
              </Button>
            </li>
          )
        })}
      </ul>
      
      <div
        {...activeTabProps}
        id={`${activeTab.props.tabKey}-panel`}
        role="tabpanel"
        aria-labelledby={active}
        className={cx(
          'bkl-tabs__tab-content',
          scrollerProps.className,
          activeTabProps.className,
        )}
      >
        {renderActive(activeTab)}
      </div>
    </div>
  );
};
Tabs.Tab = Tab;
