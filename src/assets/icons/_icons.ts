/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
type IconDef = {};
export const icons = {
  'accounts': {},
  'alert': {},
  'apps': {},
  'assessment': {},
  'audit-log': {},
  'authentication': {},
  'calendar': {},
  'caret-down': {},
  'check': {},
  'cloud-accounts': {},
  'copy': {},
  'cross': {},
  'dashboard': {},
  'dataverse': {},
  'delete': {},
  'docs': {},
  'download': {},
  'edit-params': {},
  'edit': {},
  'email': {},
  'eye': {},
  'file': {},
  'file-error': {},
  'fortanix-ki': {},
  'folder': {},
  'graph': {},
  'groups': {},
  'hide': {},
  'home': {},
  'iam': {},
  'info': {},
  'infrastructure': {},
  'integrations': {},
  'key-link': {},
  'key': {},
  'no-login': {},
  'page-forward': {},
  'plugins': {},
  'policy': {},
  'print': {},
  'scripts': {},
  'search': {},
  'security-object': {},
  'services': {},
  'settings': {},
  'solutions': {},
  'success': {},
  'tasks': {},
  'user-profile': {},
  'user': {},
  'warning': {},
  'workflows': {},
} as const satisfies Record<string, IconDef>;

export type IconKey = keyof typeof icons;

const iconKeys = new Set(Object.keys(icons));
export const isIconKey = (iconKey: string): iconKey is IconKey => {
  return iconKeys.has(iconKey);
};
