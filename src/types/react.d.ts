/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  ButtonHTMLAttributes as ReactButtonHTMLAttributes,
  DialogHTMLAttributes as ReactDialogHTMLAttributes,
} from 'react';


declare module 'react' {
  // Remove this once React adds support: https://github.com/facebook/react/issues/32478
  export interface ButtonHTMLAttributes<T> extends ReactButtonHTMLAttributes<T> {
    command?: undefined | string,
    commandFor?: undefined | string,
  }
  
  // Remove this once React adds support
  export interface DialogHTMLAttributes<T> extends ReactDialogHTMLAttributes<T> {
    closedBy?: undefined | string,
  }
}
