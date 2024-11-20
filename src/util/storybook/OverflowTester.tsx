/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import './OverflowTester.css';


type OverflowTesterProps = {
  lines?: number,
  openDefault?: boolean,
};
export const OverflowTester = ({ lines = 50, openDefault = false }: OverflowTesterProps) => {
  const ref = React.useRef<HTMLDetailsElement>(null);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: `openDefault` only applies on mount
  React.useEffect(() => {
    if (openDefault && ref.current) {
      ref.current.open = true;
    }
  }, []);
  
  return (
    <details ref={ref} className="util-overflow-tester">
      <summary>Test overflow</summary>
      {Array.from({ length: lines }).map((_, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
        <p key={index}>...</p>
      )}
    </details>
  );
};
