/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// FIXME: this should cause all icons in the `icons` directory to be bundled, but they aren't for some reason
// export const loadIcon = icon => import(
//   `./assets/icons/${icon}.svg`
// );


const icons = {
  'account': {
    load: () => import('./assets/icons/account.svg'),
    loadSprite: () => import('./assets/icons/account.svg?sprite'),
  },
  'accounts': {
    load: () => import('./assets/icons/accounts.svg'),
    loadSprite: () => import('./assets/icons/accounts.svg?sprite'),
  },
  'add': {
    load: () => import('./assets/icons/add.svg'),
    loadSprite: () => import('./assets/icons/add.svg?sprite'),
  },
  'alert': {
    load: () => import('./assets/icons/alert.svg'),
    loadSprite: () => import('./assets/icons/alert.svg?sprite'),
  },
  'app': {
    load: () => import('./assets/icons/app.svg'),
    loadSprite: () => import('./assets/icons/app.svg?sprite'),
  },
  'arrow-drop-down': {
    load: () => import('./assets/icons/arrow-drop-down.svg'),
    loadSprite: () => import('./assets/icons/arrow-drop-down.svg?sprite'),
  },
  'arrow-drop-up': {
    load: () => import('./assets/icons/arrow-drop-up.svg'),
    loadSprite: () => import('./assets/icons/arrow-drop-up.svg?sprite'),
  },
  'arrow-expand': {
    load: () => import('./assets/icons/arrow-expand.svg'),
    loadSprite: () => import('./assets/icons/arrow-expand.svg?sprite'),
  },
  'arrow-left': {
    load: () => import('./assets/icons/arrow-left.svg'),
    loadSprite: () => import('./assets/icons/arrow-left.svg?sprite'),
  },
  'arrow-right': {
    load: () => import('./assets/icons/arrow-right.svg'),
    loadSprite: () => import('./assets/icons/arrow-right.svg?sprite'),
  },
  'audit-log': {
    load: () => import('./assets/icons/audit-log.svg'),
    loadSprite: () => import('./assets/icons/audit-log.svg?sprite'),
  },
  'bell': {
    load: () => import('./assets/icons/bell.svg'),
    loadSprite: () => import('./assets/icons/bell.svg?sprite'),
  },
  'billing': {
    load: () => import('./assets/icons/billing.svg'),
    loadSprite: () => import('./assets/icons/billing.svg?sprite'),
  },
  'bug': {
    load: () => import('./assets/icons/bug.svg'),
    loadSprite: () => import('./assets/icons/bug.svg?sprite'),
  },
  'builds': {
    load: () => import('./assets/icons/builds.svg'),
    loadSprite: () => import('./assets/icons/builds.svg?sprite'),
  },
  'calendar': {
    load: () => import('./assets/icons/calendar.svg'),
    loadSprite: () => import('./assets/icons/calendar.svg?sprite'),
  },
  'certificate': {
    load: () => import('./assets/icons/certificate.svg'),
    loadSprite: () => import('./assets/icons/certificate.svg?sprite'),
  },
  'check': {
    load: () => import('./assets/icons/check.svg'),
    loadSprite: () => import('./assets/icons/check.svg?sprite'),
  },
  'checkbox-checked': {
    load: () => import('./assets/icons/checkbox-checked.svg'),
    loadSprite: () => import('./assets/icons/checkbox-checked.svg?sprite'),
  },
  'checkbox-disabled': {
    load: () => import('./assets/icons/checkbox-disabled.svg'),
    loadSprite: () => import('./assets/icons/checkbox-disabled.svg?sprite'),
  },
  'checkbox-unchecked': {
    load: () => import('./assets/icons/checkbox-unchecked.svg'),
    loadSprite: () => import('./assets/icons/checkbox-unchecked.svg?sprite'),
  },
  'chevron-left': {
    load: () => import('./assets/icons/chevron-left.svg'),
    loadSprite: () => import('./assets/icons/chevron-left.svg?sprite'),
  },
  'chevron-right': {
    load: () => import('./assets/icons/chevron-right.svg'),
    loadSprite: () => import('./assets/icons/chevron-right.svg?sprite'),
  },
  'clear-all': {
    load: () => import('./assets/icons/clear-all.svg'),
    loadSprite: () => import('./assets/icons/clear-all.svg?sprite'),
  },
  'connection': {
    load: () => import('./assets/icons/connection.svg'),
    loadSprite: () => import('./assets/icons/connection.svg?sprite'),
  },
  'copy': {
    load: () => import('./assets/icons/copy.svg'),
    loadSprite: () => import('./assets/icons/copy.svg?sprite'),
  },
  'color-picker': {
    load: () => import('./assets/icons/color-picker.svg'),
    loadSprite: () => import('./assets/icons/color-picker.svg?sprite'),
  },
  'cross': {
    load: () => import('./assets/icons/cross.svg'),
    loadSprite: () => import('./assets/icons/cross.svg?sprite'),
  },
  'cross-thin': {
    load: () => import('./assets/icons/cross-thin.svg'),
    loadSprite: () => import('./assets/icons/cross-thin.svg?sprite'),
  },
  'crypto-policy': {
    load: () => import('./assets/icons/crypto-policy.svg'),
    loadSprite: () => import('./assets/icons/crypto-policy.svg?sprite'),
  },
  'customers': {
    load: () => import('./assets/icons/customers.svg'),
    loadSprite: () => import('./assets/icons/customers.svg?sprite'),
  },
  'dashboard': {
    load: () => import('./assets/icons/dashboard.svg'),
    loadSprite: () => import('./assets/icons/dashboard.svg?sprite'),
  },
  'data-center': {
    load: () => import('./assets/icons/data-center.svg'),
    loadSprite: () => import('./assets/icons/data-center.svg?sprite'),
  },
  'data-connector-read': {
    load: () => import('./assets/icons/data-connector-read.svg'),
    loadSprite: () => import('./assets/icons/data-connector-read.svg?sprite'),
  },
  'data-connector-write': {
    load: () => import('./assets/icons/data-connector-write.svg'),
    loadSprite: () => import('./assets/icons/data-connector-write.svg?sprite'),
  },
  'dataset': {
    load: () => import('./assets/icons/dataset.svg'),
    loadSprite: () => import('./assets/icons/dataset.svg?sprite'),
  },
  'dataverse': {
    load: () => import('./assets/icons/dataverse.svg'),
    loadSprite: () => import('./assets/icons/dataverse.svg?sprite'),
  },
  'delete': {
    load: () => import('./assets/icons/delete.svg'),
    loadSprite: () => import('./assets/icons/delete.svg?sprite'),
  },
  'deployment-deployed': {
    load: () => import('./assets/icons/deployment-deployed.svg'),
    loadSprite: () => import('./assets/icons/deployment-deployed.svg?sprite'),
  },
  'deployment-none': {
    load: () => import('./assets/icons/deployment-none.svg'),
    loadSprite: () => import('./assets/icons/deployment-none.svg?sprite'),
  },
  'derive': {
    load: () => import('./assets/icons/derive.svg'),
    loadSprite: () => import('./assets/icons/derive.svg?sprite'),
  },
  'docs': {
    load: () => import('./assets/icons/docs.svg'),
    loadSprite: () => import('./assets/icons/docs.svg?sprite'),
  },
  'document-blank': {
    load: () => import('./assets/icons/document-blank.svg'),
    loadSprite: () => import('./assets/icons/document-blank.svg?sprite'),
  },
  'domain': {
    load: () => import('./assets/icons/domain.svg'),
    loadSprite: () => import('./assets/icons/domain.svg?sprite'),
  },
  'download': {
    load: () => import('./assets/icons/download.svg'),
    loadSprite: () => import('./assets/icons/download.svg?sprite'),
  },
  'download-cloud': {
    load: () => import('./assets/icons/download-cloud.svg'),
    loadSprite: () => import('./assets/icons/download-cloud.svg?sprite'),
  },
  'edit-params': {
    load: () => import('./assets/icons/edit-params.svg'),
    loadSprite: () => import('./assets/icons/edit-params.svg?sprite'),
  },
  'edit': {
    load: () => import('./assets/icons/edit.svg'),
    loadSprite: () => import('./assets/icons/edit.svg?sprite'),
  },
  'em-app': {
    load: () => import('./assets/icons/em-app.svg'),
    loadSprite: () => import('./assets/icons/em-app.svg?sprite'),
  },
  'em-dashboard': {
    load: () => import('./assets/icons/em-dashboard.svg'),
    loadSprite: () => import('./assets/icons/em-dashboard.svg?sprite'),
  },
  'email': {
    load: () => import('./assets/icons/email.svg'),
    loadSprite: () => import('./assets/icons/email.svg?sprite'),
  },
  'empty-credential': {
    load: () => import('./assets/icons/empty-credential.svg'),
    loadSprite: () => import('./assets/icons/empty-credential.svg?sprite'),
  },
  'enterprise-badge': {
    load: () => import('./assets/icons/enterprise-badge.svg'),
    loadSprite: () => import('./assets/icons/enterprise-badge.svg?sprite'),
  },
  'environment-production': {
    load: () => import('./assets/icons/environment-production.svg'),
    loadSprite: () => import('./assets/icons/environment-production.svg?sprite'),
  },
  'environment-test': {
    load: () => import('./assets/icons/environment-test.svg'),
    loadSprite: () => import('./assets/icons/environment-test.svg?sprite'),
  },
  'event-critical': {
    load: () => import('./assets/icons/event-critical.svg'),
    loadSprite: () => import('./assets/icons/event-critical.svg?sprite'),
  },
  'event-error': {
    load: () => import('./assets/icons/event-error.svg'),
    loadSprite: () => import('./assets/icons/event-error.svg?sprite'),
  },
  'event-success': {
    load: () => import('./assets/icons/event-success.svg'),
    loadSprite: () => import('./assets/icons/event-success.svg?sprite'),
  },
  'event-warning': {
    load: () => import('./assets/icons/event-warning.svg'),
    loadSprite: () => import('./assets/icons/event-warning.svg?sprite'),
  },
  'expiration': {
    load: () => import('./assets/icons/expiration.svg'),
    loadSprite: () => import('./assets/icons/expiration.svg?sprite'),
  },
  'export': {
    load: () => import('./assets/icons/export.svg'),
    loadSprite: () => import('./assets/icons/export.svg?sprite'),
  },
  'external': {
    load: () => import('./assets/icons/external.svg'),
    loadSprite: () => import('./assets/icons/external.svg?sprite'),
  },
  'external-link': {
    load: () => import('./assets/icons/external-link.svg'),
    loadSprite: () => import('./assets/icons/external-link.svg?sprite'),
  },
  'eye-closed': {
    load: () => import('./assets/icons/eye-closed.svg'),
    loadSprite: () => import('./assets/icons/eye-closed.svg?sprite'),
  },
  'eye': {
    load: () => import('./assets/icons/eye.svg'),
    loadSprite: () => import('./assets/icons/eye.svg?sprite'),
  },
  'file': {
    load: () => import('./assets/icons/file.svg'),
    loadSprite: () => import('./assets/icons/file.svg?sprite'),
  },
  'flag': {
    load: () => import('./assets/icons/flag.svg'),
    loadSprite: () => import('./assets/icons/flag.svg?sprite'),
  },
  'forbid': {
    load: () => import('./assets/icons/forbid.svg'),
    loadSprite: () => import('./assets/icons/forbid.svg?sprite'),
  },
  'fortanix-app-edp': {
    load: () => import('./assets/icons/fortanix-app-edp.svg'),
    loadSprite: () => import('./assets/icons/fortanix-app-edp.svg?sprite'),
  },
  'fortanix-app-aci': {
    load: () => import('./assets/icons/fortanix-app-aci.svg'),
    loadSprite: () => import('./assets/icons/fortanix-app-aci.svg?sprite'),
  },
  'fortanix-app-enclave-os': {
    load: () => import('./assets/icons/fortanix-app-enclave-os.svg'),
    loadSprite: () => import('./assets/icons/fortanix-app-enclave-os.svg?sprite'),
  },
  'frame-expand': {
    load: () => import('./assets/icons/frame-expand.svg'),
    loadSprite: () => import('./assets/icons/frame-expand.svg?sprite'),
  },
  'fresh': {
    load: () => import('./assets/icons/fresh.svg'),
    loadSprite: () => import('./assets/icons/fresh.svg?sprite'),
  },
  'generated': {
    load: () => import('./assets/icons/generated.svg'),
    loadSprite: () => import('./assets/icons/generated.svg?sprite'),
  },
  'gift': {
    load: () => import('./assets/icons/gift.svg'),
    loadSprite: () => import('./assets/icons/gift.svg?sprite'),
  },
  'global': {
    load: () => import('./assets/icons/global.svg'),
    loadSprite: () => import('./assets/icons/global.svg?sprite'),
  },
  'group': {
    load: () => import('./assets/icons/group.svg'),
    loadSprite: () => import('./assets/icons/group.svg?sprite'),
  },
  'help': {
    load: () => import('./assets/icons/help.svg'),
    loadSprite: () => import('./assets/icons/help.svg?sprite'),
  },
  'hsm': {
    load: () => import('./assets/icons/hsm.svg'),
    loadSprite: () => import('./assets/icons/hsm.svg?sprite'),
  },
  'home': {
    load: () => import('./assets/icons/home.svg'),
    loadSprite: () => import('./assets/icons/home.svg?sprite'),
  },
  'home-info': {
    load: () => import('./assets/icons/home-info.svg'),
    loadSprite: () => import('./assets/icons/home-info.svg?sprite'),
  },
  'horizontal-collapse': {
    load: () => import('./assets/icons/horizontal-collapse.svg'),
    loadSprite: () => import('./assets/icons/horizontal-collapse.svg?sprite'),
  },
  'horizontal-expand': {
    load: () => import('./assets/icons/horizontal-expand.svg'),
    loadSprite: () => import('./assets/icons/horizontal-expand.svg?sprite'),
  },
  'info': {
    load: () => import('./assets/icons/info.svg'),
    loadSprite: () => import('./assets/icons/info.svg?sprite'),
  },
  'install': {
    load: () => import('./assets/icons/install.svg'),
    loadSprite: () => import('./assets/icons/install.svg?sprite'),
  },
  'integration': {
    load: () => import('./assets/icons/integration.svg'),
    loadSprite: () => import('./assets/icons/integration.svg?sprite'),
  },
  'key-clone': {
    load: () => import('./assets/icons/key-clone.svg'),
    loadSprite: () => import('./assets/icons/key-clone.svg?sprite'),
  },
  'key-custodian-policy': {
    load: () => import('./assets/icons/key-custodian-policy.svg'),
    loadSprite: () => import('./assets/icons/key-custodian-policy.svg?sprite'),
  },
  'key-destroy': {
    load: () => import('./assets/icons/key-destroy.svg'),
    loadSprite: () => import('./assets/icons/key-destroy.svg?sprite'),
  },
  'key-download': {
    load: () => import('./assets/icons/key-download.svg'),
    loadSprite: () => import('./assets/icons/key-download.svg?sprite'),
  },
  'key-justification-policy': {
    load: () => import('./assets/icons/key-justification-policy.svg'),
    loadSprite: () => import('./assets/icons/key-justification-policy.svg?sprite'),
  },
  'key-link': {
    load: () => import('./assets/icons/key-link.svg'),
    loadSprite: () => import('./assets/icons/key-link.svg?sprite'),
  },
  'key-metadata-policy': {
    load: () => import('./assets/icons/key-metadata-policy.svg'),
    loadSprite: () => import('./assets/icons/key-metadata-policy.svg?sprite'),
  },
  'key-primary': {
    load: () => import('./assets/icons/key-primary.svg'),
    loadSprite: () => import('./assets/icons/key-primary.svg?sprite'),
  },
  'key-remove': {
    load: () => import('./assets/icons/key-remove.svg'),
    loadSprite: () => import('./assets/icons/key-remove.svg?sprite'),
  },
  'key-rotation': {
    load: () => import('./assets/icons/key-rotation.svg'),
    loadSprite: () => import('./assets/icons/key-rotation.svg?sprite'),
  },
  'key-undo-policy': {
    load: () => import('./assets/icons/key-undo-policy.svg'),
    loadSprite: () => import('./assets/icons/key-undo-policy.svg?sprite'),
  },
  'key-wrapping': {
    load: () => import('./assets/icons/key-wrapping.svg'),
    loadSprite: () => import('./assets/icons/key-wrapping.svg?sprite'),
  },
  'key': {
    load: () => import('./assets/icons/key.svg'),
    loadSprite: () => import('./assets/icons/key.svg?sprite'),
  },
  'leave-account': {
    load: () => import('./assets/icons/leave-account.svg'),
    loadSprite: () => import('./assets/icons/leave-account.svg?sprite'),
  },
  'link': {
    load: () => import('./assets/icons/link.svg'),
    loadSprite: () => import('./assets/icons/link.svg?sprite'),
  },
  'lock-closed': {
    load: () => import('./assets/icons/lock-closed.svg'),
    loadSprite: () => import('./assets/icons/lock-closed.svg?sprite'),
  },
  'lock': {
    load: () => import('./assets/icons/lock.svg'),
    loadSprite: () => import('./assets/icons/lock.svg?sprite'),
  },
  'locked-user': {
    load: () => import('./assets/icons/locked-user.svg'),
    loadSprite: () => import('./assets/icons/locked-user.svg?sprite'),
  },
  'marketplace': {
    load: () => import('./assets/icons/marketplace.svg'),
    loadSprite: () => import('./assets/icons/marketplace.svg?sprite'),
  },
  'minus': {
    load: () => import('./assets/icons/minus.svg'),
    loadSprite: () => import('./assets/icons/minus.svg?sprite'),
  },
  'monitoring': {
    load: () => import('./assets/icons/monitoring.svg'),
    loadSprite: () => import('./assets/icons/monitoring.svg?sprite'),
  },
  'no-logging': {
    load: () => import('./assets/icons/no-logging.svg'),
    loadSprite: () => import('./assets/icons/no-logging.svg?sprite'),
  },
  'operations': {
    load: () => import('./assets/icons/operations.svg'),
    loadSprite: () => import('./assets/icons/operations.svg?sprite'),
  },
  'node-cluster': {
    load: () => import('./assets/icons/node-cluster.svg'),
    loadSprite: () => import('./assets/icons/node-cluster.svg?sprite'),
  },
  'node': {
    load: () => import('./assets/icons/node.svg'),
    loadSprite: () => import('./assets/icons/node.svg?sprite'),
  },
  'options': {
    load: () => import('./assets/icons/options.svg'),
    loadSprite: () => import('./assets/icons/options.svg?sprite'),
  },
  'pending': {
    load: () => import('./assets/icons/pending.svg'),
    loadSprite: () => import('./assets/icons/pending.svg?sprite'),
  },
  'play': {
    load: () => import('./assets/icons/play.svg'),
    loadSprite: () => import('./assets/icons/play.svg?sprite'),
  },
  'plug': {
    load: () => import('./assets/icons/plug.svg'),
    loadSprite: () => import('./assets/icons/plug.svg?sprite'),
  },
  'plugin-clone': {
    load: () => import('./assets/icons/plugin-clone.svg'),
    loadSprite: () => import('./assets/icons/plugin-clone.svg?sprite'),
  },
  'plugin': {
    load: () => import('./assets/icons/plugin.svg'),
    loadSprite: () => import('./assets/icons/plugin.svg?sprite'),
  },
  'plugins': {
    load: () => import('./assets/icons/plugins.svg'),
    loadSprite: () => import('./assets/icons/plugins.svg?sprite'),
  },
  'pod': {
    load: () => import('./assets/icons/pod.svg'),
    loadSprite: () => import('./assets/icons/pod.svg?sprite'),
  },
  'print': {
    load: () => import('./assets/icons/print.svg'),
    loadSprite: () => import('./assets/icons/print.svg?sprite'),
  },
  'projects': {
    load: () => import('./assets/icons/projects.svg'),
    loadSprite: () => import('./assets/icons/projects.svg?sprite'),
  },
  'python': {
    load: () => import('./assets/icons/python.svg'),
    loadSprite: () => import('./assets/icons/python.svg?sprite'),
  },
  'quorum': {
    load: () => import('./assets/icons/quorum.svg'),
    loadSprite: () => import('./assets/icons/quorum.svg?sprite'),
  },
  'refresh': {
    load: () => import('./assets/icons/refresh.svg'),
    loadSprite: () => import('./assets/icons/refresh.svg?sprite'),
  },
  'regenerate': {
    load: () => import('./assets/icons/regenerate.svg'),
    loadSprite: () => import('./assets/icons/regenerate.svg?sprite'),
  },
  'region': {
    load: () => import('./assets/icons/region.svg'),
    loadSprite: () => import('./assets/icons/region.svg?sprite'),
  },
  'reports': {
    load: () => import('./assets/icons/reports.svg'),
    loadSprite: () => import('./assets/icons/reports.svg?sprite'),
  },
  'request-approve': {
    load: () => import('./assets/icons/request-approve.svg'),
    loadSprite: () => import('./assets/icons/request-approve.svg?sprite'),
  },
  'request-decline': {
    load: () => import('./assets/icons/request-decline.svg'),
    loadSprite: () => import('./assets/icons/request-decline.svg?sprite'),
  },
  'reseller': {
    load: () => import('./assets/icons/reseller.svg'),
    loadSprite: () => import('./assets/icons/reseller.svg?sprite'),
  },
  'script': {
    load: () => import('./assets/icons/script.svg'),
    loadSprite: () => import('./assets/icons/script.svg?sprite'),
  },
  'search': {
    load: () => import('./assets/icons/search.svg'),
    loadSprite: () => import('./assets/icons/search.svg?sprite'),
  },
  'service-account': {
    load: () => import('./assets/icons/service-account.svg'),
    loadSprite: () => import('./assets/icons/service-account.svg?sprite'),
  },
  'settings': {
    load: () => import('./assets/icons/settings.svg'),
    loadSprite: () => import('./assets/icons/settings.svg?sprite'),
  },
  'sidebar-closed': {
    load: () => import('./assets/icons/sidebar-closed.svg'),
    loadSprite: () => import('./assets/icons/sidebar-closed.svg?sprite'),
  },
  'sidebar-open': {
    load: () => import('./assets/icons/sidebar-open.svg'),
    loadSprite: () => import('./assets/icons/sidebar-open.svg?sprite'),
  },
  'sign-out': {
    load: () => import('./assets/icons/sign-out.svg'),
    loadSprite: () => import('./assets/icons/sign-out.svg?sprite'),
  },
  'sign': {
    load: () => import('./assets/icons/sign.svg'),
    loadSprite: () => import('./assets/icons/sign.svg?sprite'),
  },
  'software': {
    load: () => import('./assets/icons/software.svg'),
    loadSprite: () => import('./assets/icons/software.svg?sprite'),
  },
  'sql': {
    load: () => import('./assets/icons/sql.svg'),
    loadSprite: () => import('./assets/icons/sql.svg?sprite'),
  },
  'sql-aggregate': {
    load: () => import('./assets/icons/sql-aggregate.svg'),
    loadSprite: () => import('./assets/icons/sql-aggregate.svg?sprite'),
  },
  'stack': {
    load: () => import('./assets/icons/stack.svg'),
    loadSprite: () => import('./assets/icons/stack.svg?sprite'),
  },
  'star-empty': {
    load: () => import('./assets/icons/star-empty.svg'),
    loadSprite: () => import('./assets/icons/star-empty.svg?sprite'),
  },
  'star-fill': {
    load: () => import('./assets/icons/star-fill.svg'),
    loadSprite: () => import('./assets/icons/star-fill.svg?sprite'),
  },
  'subscription': {
    load: () => import('./assets/icons/subscription.svg'),
    loadSprite: () => import('./assets/icons/subscription.svg?sprite'),
  },
  'support': {
    load: () => import('./assets/icons/support.svg'),
    loadSprite: () => import('./assets/icons/support.svg?sprite'),
  },
  'switcher': {
    load: () => import('./assets/icons/switcher.svg'),
    loadSprite: () => import('./assets/icons/switcher.svg?sprite'),
  },
  'sysadmin': {
    load: () => import('./assets/icons/sysadmin.svg'),
    loadSprite: () => import('./assets/icons/sysadmin.svg?sprite'),
  },
  'tag': {
    load: () => import('./assets/icons/tag.svg'),
    loadSprite: () => import('./assets/icons/tag.svg?sprite'),
  },
  'target': {
    load: () => import('./assets/icons/target.svg'),
    loadSprite: () => import('./assets/icons/target.svg?sprite'),
  },
  'tasks': {
    load: () => import('./assets/icons/tasks.svg'),
    loadSprite: () => import('./assets/icons/tasks.svg?sprite'),
  },
  'tfa-user': {
    load: () => import('./assets/icons/tfa-user.svg'),
    loadSprite: () => import('./assets/icons/tfa-user.svg?sprite'),
  },
  'tfa': {
    load: () => import('./assets/icons/tfa.svg'),
    loadSprite: () => import('./assets/icons/tfa.svg?sprite'),
  },
  'tokenization': {
    load: () => import('./assets/icons/tokenization.svg'),
    loadSprite: () => import('./assets/icons/tokenization.svg?sprite'),
  },
  'tools': {
    load: () => import('./assets/icons/tools.svg'),
    loadSprite: () => import('./assets/icons/tools.svg?sprite'),
  },
  'transition-from': {
    load: () => import('./assets/icons/transition-from.svg'),
    loadSprite: () => import('./assets/icons/transition-from.svg?sprite'),
  },
  'transition-to': {
    load: () => import('./assets/icons/transition-to.svg'),
    loadSprite: () => import('./assets/icons/transition-to.svg?sprite'),
  },
  'upload': {
    load: () => import('./assets/icons/upload.svg'),
    loadSprite: () => import('./assets/icons/upload.svg?sprite'),
  },
  'user': {
    load: () => import('./assets/icons/user.svg'),
    loadSprite: () => import('./assets/icons/user.svg?sprite'),
  },
  'user-remove': {
    load: () => import('./assets/icons/user-remove.svg'),
    loadSprite: () => import('./assets/icons/user-remove.svg?sprite'),
  },
  'view-type-cards': {
    load: () => import('./assets/icons/view-type-cards.svg'),
    loadSprite: () => import('./assets/icons/view-type-cards.svg?sprite'),
  },
  'view-type-list': {
    load: () => import('./assets/icons/view-type-list.svg'),
    loadSprite: () => import('./assets/icons/view-type-list.svg?sprite'),
  },
  'view-type-table': {
    load: () => import('./assets/icons/view-type-table.svg'),
    loadSprite: () => import('./assets/icons/view-type-table.svg?sprite'),
  },
  'warning': {
    load: () => import('./assets/icons/warning.svg'),
    loadSprite: () => import('./assets/icons/warning.svg?sprite'),
  },
  'workflow': {
    load: () => import('./assets/icons/workflow.svg'),
    loadSprite: () => import('./assets/icons/workflow.svg?sprite'),
  },
  'wrap': {
    load: () => import('./assets/icons/wrap.svg'),
    loadSprite: () => import('./assets/icons/wrap.svg?sprite'),
  },
  'wrench': {
    load: () => import('./assets/icons/wrench.svg'),
    loadSprite: () => import('./assets/icons/wrench.svg?sprite'),
  },
};

export default icons;
