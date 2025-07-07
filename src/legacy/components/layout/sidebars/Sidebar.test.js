
import * as React from 'react';
import * as TL from '@testing-library/react';

import Sidebar from './Sidebar';


describe('Sidebar', () => {
  beforeEach(TL.cleanup);
  
  test('should render a sidebar', () => {
    const { container, ...queries } = TL.render(
      <Sidebar data-label="sidebar">hello</Sidebar>
    );
    const element = queries.getByTestId('sidebar');
    
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element).toHaveProperty('tagName', 'ASIDE');
    expect(element).toHaveTextContent('hello');
  });
});
