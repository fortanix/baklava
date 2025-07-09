/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as React from 'react';

import './StoryBookLink.scss';

export const DummyLink = (props: React.ComponentProps<'a'>) =>
  <a className="bkl-dummy-link" href="/" onClick={event => { event.preventDefault(); }} {...props}/>;
