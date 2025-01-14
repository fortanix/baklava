/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from "classnames";

import { Icon } from "../../../graphics/Icon/Icon.tsx";
import { Input } from "../../../forms/controls/Input/Input.tsx";

import {
	type PageSizeOption,
	PaginationSizeSelector,
} from "./PaginationSizeSelector.tsx";
import { useTable } from "../DataTableContext.tsx";

import "./Pagination.scss";

type PaginationProps = {
	pageSizeOptions?: Array<PageSizeOption>;
};
export const Pagination = ({ pageSizeOptions }: PaginationProps) => {
	const { table } = useTable();

	/*
	Available pagination state:
	- table.state.pageIndex
	- table.state.pageSize
	- table.canPreviousPage
	- table.canNextPage
	- table.pageOptions
	- table.pageCount
	- table.gotoPage
	- table.nextPage
	- table.previousPage
	- table.setPageSize
	*/

	return (
		<div className="pagination">
			<PaginationSizeSelector pageSizeOptions={pageSizeOptions} />

			<div className="pager pager--indexed">
				<Icon
					icon="page-backward"
					className={cx("pager__nav pager__nav--prev", {
						disabled: !table.canPreviousPage,
					})}
					onClick={() => table.gotoPage(0)}
				/>
				<div className="pagination-main">
					<Icon
						icon="caret-left"
						className={cx("pager__nav pager__nav--prev", {
							disabled: !table.canPreviousPage,
						})}
						onClick={table.previousPage}
					/>
					<Input
						type="number"
						className="pagination__page-input"
						value={table.state.pageIndex + 1}
						max={table.pageCount}
						min={1}
						onChange={(event) =>
							table.gotoPage(Number.parseInt(event.target.value) - 1)
						}
					/>
					of {table.pageCount}
					<Icon
						icon="caret-right"
						className={cx("pager__nav pager__nav--next", {
							disabled: !table.canNextPage,
						})}
						onClick={table.nextPage}
					/>
				</div>
				<Icon
					name="chevron-right"
					icon="page-forward"
					className={cx("pager__nav pager__nav--next", {
						disabled: !table.canNextPage,
					})}
					onClick={() => table.gotoPage(table.pageCount - 1)}
				/>
			</div>
		</div>
	);
};
