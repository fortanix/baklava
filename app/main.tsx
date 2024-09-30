/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactDOM from 'react-dom/client';

// Needs to be first in import order, so that CSS layers will be properly defined
import '../src/styling/main.css';

import { Demo } from './Demo.tsx';



export const App = () => {
  return (
    <Demo/>
  );
};

window.addEventListener('DOMContentLoaded', (): void => {
  const mountElement: null | HTMLElement = document.getElementById('app-root');
  
  if (mountElement === null) {
    console.error(`Missing app mount element`);
    return;
  }
  
  const options = {};
  ReactDOM.createRoot(mountElement, options).render(
    <App/>
  );
});
