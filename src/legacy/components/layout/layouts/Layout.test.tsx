/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { Layout } from './Layout.tsx';


describe('Layout', () => {
  beforeEach(TL.cleanup);
  
  test('should render a layout', () => {
    const { container, ...queries } = TL.render(
      <Layout data-label="layout" state={{ sidebarCollapsed: false }} updateState={() => {}}>hello</Layout>
    );
    const element = queries.getByTestId('layout');
    
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element).toHaveProperty('tagName', 'MAIN');
    expect(element).toHaveTextContent('hello');
  });
  
  test('should provide a context', () => {
    const layoutState = Layout.initLayoutState({ sidebarCollapsed: true });
    const updateLayoutState = vi.fn();
    
    const { container, ...queries } = TL.render(
      <Layout data-label="layout"
        state={layoutState}
        updateState={updateLayoutState}
      >
        <Layout.Context.Consumer>
          {({ update: updateLayoutState, ...layoutState }) =>
            <button
              type="button"
              data-label="layout-consumer"
              data-sidebar-collapsed={layoutState.sidebarCollapsed}
              onClick={() => {
                updateLayoutState({ ...layoutState, sidebarCollapsed: !layoutState.sidebarCollapsed });
              }}
            />
          }
        </Layout.Context.Consumer>
      </Layout>
    );
    const layout = queries.getByTestId('layout');
    const layoutConsumer = queries.getByTestId('layout-consumer');
    
    expect(layoutConsumer).toHaveAttribute('data-sidebar-collapsed', 'true');
    
    TL.act(() => { layoutConsumer.click(); });
    
    expect(updateLayoutState).toHaveBeenCalledTimes(1);
    expect(updateLayoutState).toHaveBeenLastCalledWith({
      ...layoutState,
      sidebarCollapsed: false,
    });
  });
});
