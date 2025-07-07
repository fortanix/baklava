
import $msg from 'message-tag';

import { classNames as cx } from '../../../util/component_util';
import { handleTabKeyDown } from '../../../util/keyboardHandlers';
import * as React from 'react';
import * as ReactIs from 'react-is';

import { PanelProps, Panel } from '../../containers/panel/Panel';
import { useScroller } from '../../layout/util/Scroller';
import { Button } from '../../buttons/Button';

import './TabsEmbedded.scss';


export type TabKey = string;

export type TabEmbeddedProps = PanelProps & {
  children: React.ReactNode | (() => React.ReactNode),
  tabKey: string,
  title: React.ReactNode,
  hide?: boolean,
  className?: string,
};
export const Tab = ({ children }: TabEmbeddedProps): React.ReactElement => {
  return children as React.ReactElement;
};
type TabElement = React.ReactElement<TabEmbeddedProps, React.FunctionComponent<typeof Tab>>;


export type TabsEmbeddedProps = PanelProps & {
  children: React.ReactNode | (() => React.ReactNode),
  active: TabKey,
  onSwitch: (tabKey: TabKey) => void,
};
export const TabsEmbedded = (props: TabsEmbeddedProps) => {
  const {
    children,
    className,
    active,
    onSwitch,
    ...propsRest
  } = props;
  
  const tabsRef = React.useRef<HTMLButtonElement[]>([]);

  if (typeof active !== 'string') {
    console.error($msg`Missing active tab, given ${active}`);
    return null;
  }
  
  const scrollerProps = useScroller();
  // Select the active tab among the given list of tabs
  const getActiveTab = (tabs: Array<TabElement>) => {
    const activeTabs = tabs.filter(child => child.props.tabKey === active);
    
    if (activeTabs.length === 0) { throw new TypeError($msg`Active tab not found: ${active}`); }
    if (activeTabs.length > 1) { throw new TypeError($msg`Ambiguous active tab`); }
    
    const activeTab = activeTabs[0];
    return activeTab;
  };
  
  const getActiveTabProps = (tab: TabElement) => {
    const { children, tabKey, title, hide, ...tabProps } = tab.props;
    return tabProps;
  };
  
  const renderActive = (tab: TabElement) => {
    let tabElement;
    if (typeof tab.props.children === 'function') {
      tabElement = tab.props.children();
    } else {
      tabElement = tab.props.children;
    }
    return tabElement;
  };
  
  React.Children.forEach(children, (child: React.ReactNode) => {
    if (!ReactIs.isElement(child) || child.type !== Tab) {
      throw new TypeError(
        $msg`Expected only children of type Tab, received ${child}`,
      );
    }
  });
  
  const tabs = React.Children.toArray(children) as Array<TabElement>;
  const activeTab = getActiveTab(tabs);
  const activeTabProps = getActiveTabProps(activeTab);
  
  return (
    <Panel {...propsRest} role="tablist" className={cx('bkl-tabs-embedded', className)}>
      <ul className="bkl-tabs-embedded__switcher">
        {tabs.map((tab, index) => {
          const { hide, tabKey, className, title } = tab.props;
          if(hide) return null;
          const isActive = tabKey === active;
          return (
            <li key={tabKey} role="presentation">
              <Button
                plain
                id={tabKey}
                role="tab"
                ref={el => (tabsRef.current[index] = el)}
                data-tab={tabKey}
                aria-selected={isActive}
                aria-controls={`${tabKey}-panel`}
                tabIndex={isActive ? 0 : -1}
                className={cx('bkl-tabs-embedded__switcher__tab', className, { active: isActive })}
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
          'bkl-tabs-embedded__tab-content',
          scrollerProps.className,
          activeTabProps.className,
        )}
      >
        {renderActive(activeTab)}
      </div>
    </Panel>
  );
};
TabsEmbedded.Tab = Tab;
