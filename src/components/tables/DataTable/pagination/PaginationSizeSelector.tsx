/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../../util/componentUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { MenuProvider } from '../../../overlays/MenuProvider/MenuProvider.tsx';

import { useTable } from '../DataTableContext.tsx';

import cl from './PaginationSizeSelector.module.scss';


export type PageSizeOption = number;
export const defaultPageSizeOptions: Array<PageSizeOption> = [10, 25, 50, 100];

type PaginationSizeSelectorProps = {
  pageSizeOptions?: undefined | Array<PageSizeOption>,
  pageSizeLabel?: undefined | string,
};
export const PaginationSizeSelector = (props: PaginationSizeSelectorProps) => {
  const { pageSizeOptions = defaultPageSizeOptions, pageSizeLabel = 'Rows per page' } = props;
  
  const { table } = useTable();
  
  return (
    <div className={cx(cl['bk-page-size-selector'])}>
      {pageSizeLabel}:
      
      <MenuProvider
        label="Page size selector"
        className={cx(cl['page-size-selector__dropdown'])}
        items={pageSizeOptions.map((pageSize) => (
          <MenuProvider.Option
            key={pageSize.toString()}
            itemKey={pageSize.toString()}
            label={`${pageSize}`}
            onSelect={() => {
              table.setPageSize(pageSize);
            }}
          />
        ))}
      >
        {({ props, open }) => (
          <Button
            kind="tertiary"
            {...props()}
            className={cx(
              cl['page-size-selector__trigger'],
              { [cl['page-size-selector__trigger--open']]: open },
            )}
          >
            {table.state.pageSize}
            <Icon icon="caret-down" className={cx(cl['page-size-selector__trigger__icon'])}/>
          </Button>
        )}
      </MenuProvider>
    </div>
  );
};
