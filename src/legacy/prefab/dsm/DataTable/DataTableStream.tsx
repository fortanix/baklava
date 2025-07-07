/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../util/component_util.tsx';
import * as React from 'react';

import { PaginationStream } from '../../../components/tables/DataTable/pagination/PaginationStream.tsx';

export { PaginationStream };

import * as DataTable from '../../../components/tables/DataTable/DataTableStream.tsx';
export * from '../../../components/tables/DataTable/DataTableStream.tsx';
export * from '../../../components/tables/DataTable/DataTableContext.tsx';
import './DataTableStream.scss';


export type DataTableStreamProps = React.ComponentPropsWithRef<typeof DataTable.DataTableStream>;
export const DataTableStream = (props: DataTableStreamProps) => {
  return (
    <DataTable.DataTableStream {...props} className={cx(props.className, 'bkl-dsm-data-table-stream')}/>
  );
};

DataTableStream.displayName = 'DataTableStream';
