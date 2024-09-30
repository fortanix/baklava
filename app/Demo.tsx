/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { OverflowTester } from '../src/util/storybook/OverflowTester.tsx';

import { Header } from '../src/layouts/AppLayout/Header/Header.tsx';
import { Sidebar } from '../src/layouts/AppLayout/Sidebar/Sidebar.tsx';
import { Logo } from '../src/layouts/AppLayout/Logo/Logo.tsx';
import { Nav } from '../src/layouts/AppLayout/Nav/Nav.tsx';
import { AppLayout } from '../src/layouts/AppLayout/AppLayout.tsx';


export const Demo = () => {
  return (
    <AppLayout>
      <Header/>
      <aside className="bk-layout__sidebar">
        <Sidebar>
          <Logo/>
          <Nav/>
          <OverflowTester lines={45}/>
        </Sidebar>
      </aside>
      <main className="bk-layout__content">
        <OverflowTester/>
      </main>
      <footer className="bk-layout__footer">
        <span className="version">Version: 4.24.2343</span>
      </footer>
    </AppLayout>
  );
};
