
import * as React from 'react';
import * as TL from '@testing-library/react';

import { Nav, NavItem } from './Nav';


describe('Nav', () => {
  beforeEach(TL.cleanup);
  
  test('should render a nav', () => {
    const { container, ...queries } = TL.render(
      <Nav data-label="nav">
        <NavItem data-label="nav-item">
          Test
        </NavItem>
      </Nav>
    );
    const navElement = queries.getByTestId('nav');
    expect(navElement).toBeInstanceOf(HTMLElement);
    expect(navElement).toHaveProperty('tagName', 'NAV');
    
    const navItemElement = queries.getByTestId('nav-item');
    expect(navItemElement).toBeInstanceOf(HTMLAnchorElement);
    expect(navItemElement).toHaveTextContent('Test');
  });
});
