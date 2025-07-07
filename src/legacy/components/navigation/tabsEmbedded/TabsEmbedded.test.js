
import * as React from 'react';
import * as TL from '@testing-library/react';

import { TabsEmbedded } from './TabsEmbedded';


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
          render={() => <>Tab 1 contents</>}
        />
      </TabsEmbedded>,
    );
    const element = queries.getByTestId('tabs');

    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element).toHaveProperty('tagName', 'DIV');
  });

  test('should switch tabs when clicking on a tab', () => {
    const handleSwitch = jest.fn();

    const { container, ...queries } = TL.render(
      <TabsEmbedded data-label="tabs"
        active="tab1"
        onSwitch={handleSwitch}
      >
        <TabsEmbedded.Tab
          data-label="tab1"
          tabKey="tab1"
          title="Tab 1"
          render={() => <>Tab 1 contents</>}
        />
        <TabsEmbedded.Tab
          data-label="tab2"
          tabKey="tab2"
          title="Tab 2"
          render={() => <>Tab 2 contents</>}
        />
      </TabsEmbedded>,
    );
    const element = queries.getByTestId('tabs');

    TL.fireEvent.click(element.querySelector(`[data-tab="tab2"]`));

    expect(handleSwitch.mock.calls.length).toBe(1);
    expect(handleSwitch).toHaveBeenLastCalledWith('tab2');
  });
});
