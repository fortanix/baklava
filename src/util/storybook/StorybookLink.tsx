/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { mergeCallbacks } from '../reactUtil.ts';
import { notify } from '../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';


const handleClick = (event: React.MouseEvent) => {
  event.preventDefault();
};
const handleClickWithNotify = (event: React.MouseEvent) => {
  event.preventDefault();
  notify.info('Clicked the link');
};

type DummyLinkProps = React.ComponentProps<'a'>;
export const DummyLink = (props: DummyLinkProps) =>
  <a href="/" {...props} onClick={mergeCallbacks([handleClick, props.onClick])}/>;

type DummyBkLinkProps = React.ComponentProps<typeof Link>;
export const DummyBkLink = (props: DummyBkLinkProps) =>
  <Link href="/" {...props} onClick={mergeCallbacks([handleClick, props.onClick])}/>;

type DummyBkLinkWithNotifyProps = React.ComponentProps<typeof Link>;
export const DummyBkLinkWithNotify = (props: DummyBkLinkWithNotifyProps) =>
  <Link href="/" {...props} onClick={mergeCallbacks([handleClickWithNotify, props.onClick])}/>;

type DummyBkLinkUnstyledProps = React.ComponentProps<typeof Link>;
export const DummyBkLinkUnstyled = (props: DummyBkLinkUnstyledProps) =>
  <Link unstyled href="/" {...props} onClick={mergeCallbacks([handleClickWithNotify, props.onClick])}/>;
