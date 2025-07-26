/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { Sidebar } from './Sidebar.tsx';


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
