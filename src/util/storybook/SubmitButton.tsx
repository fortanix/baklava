/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { internalSubmitSymbol, Button } from '../../components/actions/Button/Button.tsx';


export const SubmitButton = (props: React.ComponentProps<typeof Button>) =>
  // @ts-expect-error We're using an invalid `type` on purpose here, this is meant to be used internally only.
  <Button kind="primary" {...props} type={internalSubmitSymbol}/>;
