/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { Tabs } from './Tabs.tsx';


describe('Tabs', () => {
  beforeEach(TL.cleanup);
  
  test('should render Tabs', () => {
    const { container, ...queries } = TL.render(
      <Tabs data-label="tabs"
        active="tab1"
        onSwitch={() => {}}
      >
        <Tabs.Tab
          tabKey="tab1"
          title="Tab 1"
          render={() => <>Tab 1 contents</>}
        >
          Tab
        </Tabs.Tab>
      </Tabs>
    );
    const element = queries.getByTestId('tabs');
    
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element).toHaveProperty('tagName', 'DIV');
  });
  
  test('should switch tabs when clicking on a tab', () => {
    const handleSwitch = vi.fn();
    
    const { container, ...queries } = TL.render(
      <Tabs data-label="tabs"
        active="tab1"
        onSwitch={handleSwitch}
      >
        <Tabs.Tab
          data-label="tab1"
          tabKey="tab1"
          title="Tab 1"
          render={() => <>Tab 1 contents</>}
        >
          Tab
        </Tabs.Tab>
        <Tabs.Tab
          data-label="tab2"
          tabKey="tab2"
          title="Tab 2"
          render={() => <>Tab 2 contents</>}
        >
          Tab
        </Tabs.Tab>
      </Tabs>
    );
    const element = queries.getByTestId('tabs');
    const tab2 = element.querySelector(`[data-tab="tab2"]`);
    if (!tab2) { throw new Error(`Could not find element: tab2`); }
    
    TL.fireEvent.click(tab2);
    
    expect(handleSwitch.mock.calls.length).toBe(1);
    expect(handleSwitch).toHaveBeenLastCalledWith('tab2');
  });
});
