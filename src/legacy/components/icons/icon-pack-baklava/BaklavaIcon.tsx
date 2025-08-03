/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import iconIds from 'virtual:svg-icons-names';

import { SpriteIcon } from '../Icon.tsx';


const legacyIconIds = (iconIds as Array<string>)
  .filter(iconId => iconId.startsWith('baklava-icon-legacy-'))
  .map(iconId => iconId.replace('baklava-icon-legacy-', ''));

export type IconKey = string; // FIXME
export const isIconKey = (icon: string): icon is IconKey => {
  return legacyIconIds.includes(icon);
};

// Previously, `BaklavaIcon` was a wrapper around `SpriteIcon` that came preconfigured with Baklava icons.
// Currently, `SpriteIcon` can do this on its own, so this has become a simple wrapper.
type BaklavaIconProps = Omit<React.ComponentProps<typeof SpriteIcon>, 'name' | 'icon'> & { icon: string };
export const BaklavaIcon = ({ icon, ...propsRest }: BaklavaIconProps) => {
  return <SpriteIcon name={icon} {...propsRest}/>;
};
