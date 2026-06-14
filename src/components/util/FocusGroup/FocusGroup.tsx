/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce } from '../../../util/reactUtil.ts';

import * as FG from '@microsoft/focusgroup-polyfill/shadowless';


type FocusGroupProps = Omit<React.ComponentProps<'div'>, 'focusgroup'> & {
  focusGroup: string,
};
export const FocusGroup = (props: FocusGroupProps) => {
  const { focusGroup, ...propsRest } = props;
  
  const ref = React.useRef<HTMLDivElement>(null);
  
  useEffectOnce(() => {
    if (ref.current) {
      FG.polyfill(ref.current);
    }
  });
  
  return (
    <div
      {...propsRest}
      ref={mergeRefs(ref, props.ref)}
      // @ts-ignore
      focusgroup={focusGroup}
    />
  );
};
