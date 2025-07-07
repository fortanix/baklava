
import { classNames as cx } from '../../../util/component_util';
import * as React from 'react';

import { PaginationStream } from '../../../components/table/DataTable/pagination/PaginationStream';

export { PaginationStream };

import * as DataTable from '../../../components/table/DataTable/DataTableStream';
export * from '../../../components/table/DataTable/DataTableStream';
export * from '../../../components/table/DataTable/DataTableContext';
import './DataTableStream.scss';


export type DataTableStreamProps = React.ComponentPropsWithRef<typeof DataTable.DataTableStream>;
export const DataTableStream = (props: DataTableStreamProps) => {
  return (
    <DataTable.DataTableStream {...props} className={cx(props.className, 'bkl-dsm-data-table-stream')}/>
  );
};

DataTableStream.displayName = 'DataTableStream';
