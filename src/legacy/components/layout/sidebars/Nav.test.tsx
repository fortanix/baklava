/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { Nav, NavItem } from './Nav.tsx';


describe('Nav', () => {
  beforeEach(TL.cleanup);
  
  test('should render a nav', () => {
    const { container, ...queries } = TL.render(
      <Nav data-label="nav">
        <NavItem data-label="nav-item" tooltip="Test" to="/" active={false}>
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
