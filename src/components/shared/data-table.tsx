'use client';

import Feedback from '@/components/shared/feedback';
import * as Button from '@/components/ui/button';
import * as Checkbox from '@/components/ui/checkbox';
import * as Dropdown from '@/components/ui/dropdown';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import dataTableFeatures from '@/lib/constants/table-features';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
  RiSettings3Line,
} from '@remixicon/react';
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { flexRender, useTable, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';

type ServerOperations = {
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  search: string;
  onSearchChange: (value: string) => void;
};

type Props<T extends object> = {
  data: T[];
  columns: ColumnDef<typeof dataTableFeatures, T>[];
  getRowId: (row: T) => string;
  caption: string;
  loading?: boolean;
  server?: ServerOperations;
  virtualize?: boolean;
};

const DataTable = <T extends object>({
  data,
  columns,
  getRowId,
  caption,
  loading = false,
  server,
  virtualize = false,
}: Props<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const table = useTable({
    data,
    columns,
    getRowId,
    features: dataTableFeatures,
    state: {
      sorting: server?.sorting ?? sorting,
      globalFilter: server?.search ?? search,
      pagination: server?.pagination ?? pagination,
    },
    onSortingChange: server?.onSortingChange ?? setSorting,
    onGlobalFilterChange: server?.onSearchChange ?? setSearch,
    onPaginationChange: server?.onPaginationChange ?? setPagination,
    manualPagination: !!server,
    manualSorting: !!server,
    manualFiltering: !!server,
    rowCount: server?.rowCount,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    overscan: 5,
    enabled: virtualize,
  });
  const virtualRows = virtualize ? virtualizer.getVirtualItems() : [];
  const visibleRows = virtualize
    ? virtualRows.flatMap((row) => {
        const item = rows[row.index];
        return item ? [item] : [];
      })
    : rows;
  const span = table.getVisibleLeafColumns().length + 1;
  const activeSearch = server?.search ?? search;
  const activePage = server?.pagination ?? pagination;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input
                aria-label="Search records"
                placeholder="Search records..."
                value={activeSearch}
                onChange={(e) => {
                  table.setGlobalFilter(e.target.value);
                  table.setPageIndex(0);
                }}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiSettings3Line} />
              Columns
            </Button.Root>
          </Dropdown.Trigger>
          <Dropdown.Content>
            {table.getAllLeafColumns().map((column) => (
              <Dropdown.CheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) =>
                  column.toggleVisibility(checked === true)
                }
                disabled={!column.getCanHide()}
              >
                {column.id}
              </Dropdown.CheckboxItem>
            ))}
          </Dropdown.Content>
        </Dropdown.Root>
      </div>
      <div
        ref={scrollRef}
        className="overflow-auto"
        style={virtualize ? { maxHeight: 480 } : undefined}
        aria-busy={loading}
      >
        <Table.Root className="min-w-[640px]">
          <Table.Caption className="sr-only">{caption}</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox.Root
                  aria-label="Select all rows on this page"
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(value === true)
                  }
                />
              </Table.Head>
              {table
                .getHeaderGroups()
                .flatMap((group) => group.headers)
                .map((header) => (
                  <Table.Head
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    {header.column.getCanSort() ? (
                      <Button.Root
                        variant="neutral"
                        mode="ghost"
                        size="xxsmall"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span aria-hidden="true">
                          {header.column.getIsSorted() === 'asc'
                            ? '↑'
                            : header.column.getIsSorted() === 'desc'
                              ? '↓'
                              : '↕'}
                        </span>
                      </Button.Root>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </Table.Head>
                ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={span}>
                  <Feedback
                    title="Loading records"
                    description="Loading data…"
                  />
                </Table.Cell>
              </Table.Row>
            ) : rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={span}>
                  <Feedback
                    title="No records found"
                    description="Try a different search or clear the filter."
                    action={activeSearch ? 'Clear search' : undefined}
                    onAction={() => table.setGlobalFilter('')}
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              <>
                {virtualize && (virtualRows[0]?.start ?? 0) > 0 && (
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={span}
                      style={{ height: virtualRows[0]?.start ?? 0, padding: 0 }}
                    />
                  </Table.Row>
                )}
                {visibleRows.map((row) => (
                  <Table.Row
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    <Table.Cell>
                      <Checkbox.Root
                        aria-label={`Select row ${row.index + 1}`}
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) =>
                          row.toggleSelected(value === true)
                        }
                      />
                    </Table.Cell>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
                {virtualize && virtualRows.length > 0 && (
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={span}
                      style={{
                        height:
                          virtualizer.getTotalSize() -
                          (virtualRows.at(-1)?.end ?? 0),
                        padding: 0,
                      }}
                    />
                  </Table.Row>
                )}
              </>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stroke-soft-200 pt-4">
        <p className="text-xs text-text-sub-600">
          {table.getFilteredSelectedRowModel().rows.length} selected ·{' '}
          {server?.rowCount ?? table.getFilteredRowModel().rows.length} results
        </p>
        <div className="flex items-center gap-3">
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="small"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <Button.Icon as={RiArrowLeftSLine} />
          </Button.Root>
          <span className="text-xs text-text-sub-600">
            Page {activePage.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="small"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <Button.Icon as={RiArrowRightSLine} />
          </Button.Root>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
