/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { TabsEmbedded } from './TabsEmbedded.tsx';


describe('TabsEmbedded', () => {
  beforeEach(TL.cleanup);
  
  test('should render TabsEmbedded', () => {
    const { container, ...queries } = TL.render(
      <TabsEmbedded data-label="tabs"
        active="tab1"
        onSwitch={() => {}}
      >
        <TabsEmbedded.Tab
          tabKey="tab1"
          title="Tab 1"
        >
          Tab 1
        </TabsEmbedded.Tab>
      </TabsEmbedded>,
    );
    const element = queries.getByTestId('tabs');

    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element).toHaveProperty('tagName', 'DIV');
  });

  test('should switch tabs when clicking on a tab', () => {
    const handleSwitch = vi.fn();

    const { container, ...queries } = TL.render(
      <TabsEmbedded data-label="tabs"
        active="tab1"
        onSwitch={handleSwitch}
      >
        <TabsEmbedded.Tab
          data-label="tab1"
          tabKey="tab1"
          title="Tab 1"
        >
          Tab 1
        </TabsEmbedded.Tab>
        <TabsEmbedded.Tab
          data-label="tab2"
          tabKey="tab2"
          title="Tab 2"
        >
          Tab 2
        </TabsEmbedded.Tab>
      </TabsEmbedded>,
    );
    const element = queries.getByTestId('tabs');
    const tab2 = element.querySelector(`[data-tab="tab2"]`);
    if (!tab2) { throw new Error(`Could not find element: tab2`); }
    
    TL.fireEvent.click(tab2);

    expect(handleSwitch.mock.calls.length).toBe(1);
    expect(handleSwitch).toHaveBeenLastCalledWith('tab2');
  });
});
