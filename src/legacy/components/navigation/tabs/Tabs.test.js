
import * as React from 'react';
import * as TL from '@testing-library/react';

import { Tabs } from './Tabs';


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
        />
      </Tabs>
    );
    const element = queries.getByTestId('tabs');
    
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element).toHaveProperty('tagName', 'DIV');
  });
  
  test('should switch tabs when clicking on a tab', () => {
    const handleSwitch = jest.fn();
    
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
        />
        <Tabs.Tab
          data-label="tab2"
          tabKey="tab2"
          title="Tab 2"
          render={() => <>Tab 2 contents</>}
        />
      </Tabs>
    );
    const element = queries.getByTestId('tabs');
    
    TL.fireEvent.click(element.querySelector(`[data-tab="tab2"]`));
    
    expect(handleSwitch.mock.calls.length).toBe(1);
    expect(handleSwitch).toHaveBeenLastCalledWith('tab2');
  });
});
