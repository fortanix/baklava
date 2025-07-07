/* Copyright (c) Fortanix, Inc.
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
 * the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Setup React Testing Library

import { configure } from '@testing-library/react';
import '@testing-library/jest-dom'; // Extends `expect` with DOM element utilities

configure({ testIdAttribute: 'data-label' });
