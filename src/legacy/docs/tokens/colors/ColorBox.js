/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import theme from  '../../../style/main.scss';


export default ({ color }) => (
  <div
    style={{
      marginTop: '10px',
      fontFamily: theme.fontFamilyBody,
    }}
  >
    <div style={{ width: '150px', borderRadius: '10px', backgroundColor: theme[color], height: '50px'}}>
    </div>
    <div style={{ fontSize: '12px', paddingTop: '10px', textAlign: 'center' }}>
      <b>HEX:</b> {theme[color]} <br/>
    </div>
  </div>
);
