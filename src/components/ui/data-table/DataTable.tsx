import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Table components
const Table = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
          {children}
        </table>
      </div>
    </div>
  </div>
);

const TableHeader = ({ children }: { children: ReactNode }) => (
  <thead className="bg-brand-100 dark:bg-brand-600/30">
    {children}
  </thead>
);

const TableBody = ({ children }: { children: ReactNode }) => (
  <tbody className="[&_td]:py-3 [&_td]:px-4 [&_td]:text-sm [&_td]:text-gray-700 dark:[&_td]:text-gray-300 [&_td]:border-r [&_td]:border-gray-100 dark:[&_td]:border-gray-700/50 bg-white dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700/50">
    {children}
  </tbody>
);

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const TableRow = ({ children, className = '', onClick }: TableRowProps) => (
  <tr 
    className={`${onClick ? 'cursor-pointer' : ''} transition-colors ${onClick ? 'hover:bg-brand-50/50 dark:hover:bg-brand-900/20' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

interface TableCellProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
  colSpan?: number;
}

const TableCell = ({ 
  children, 
  className = '',
  isHeader = false,
  colSpan
}: TableCellProps) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm';
  const headerClasses = 'text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider';
  const cellClasses = 'text-gray-900 dark:text-gray-100';
  
  return isHeader ? (
    <th 
      scope="col" 
      className={`${baseClasses} ${headerClasses} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </th>
  ) : (
    <td className={`${baseClasses} ${cellClasses} ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
};

// DataTable component
interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  totalItems?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: TData) => void;
  onRowSelectionChange?: (selection: any) => void;
  rowSelection?: any;
  pageSize?: number;
  currentPage?: number;
}

export function DataTable<TData>({
  columns,
  data = [],
  totalItems = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  onRowClick,
  onRowSelectionChange = () => {},
  rowSelection = {},
  pageSize: externalPageSize = 10,
  currentPage: externalCurrentPage = 1,
}: DataTableProps<TData>) {
  // Check if checkbox column already exists
  const hasCheckboxColumn = columns.some(col => (col as any).id === 'select');
  
  // Only add checkbox column if it doesn't exist
  const columnsWithCheckbox = hasCheckboxColumn 
    ? columns 
    : [
        {
          id: 'select',
          header: ({ table }: { table: any }) => (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          ),
          cell: ({ row }: { row: any }) => (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>(rowSelection);
  
  // Sync external rowSelection with internal state
  useEffect(() => {
    setInternalRowSelection(rowSelection);
  }, [rowSelection]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: externalCurrentPage - 1, // 0-based for internal use
    pageSize: externalPageSize,
  });

  const table = useReactTable({
    data,
    columns: columnsWithCheckbox,
    state: {
      sorting,
      columnFilters,
      rowSelection: internalRowSelection,
      pagination,
    },
    pageCount: Math.ceil(totalItems / pagination.pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(internalRowSelection) : updater;
      setInternalRowSelection(newSelection);
      onRowSelectionChange(newSelection);
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    const newPagination = {
      ...pagination,
      pageSize: newSize,
      pageIndex: 0, // Reset to first page
    };
    setPagination(newPagination);
    onPageSizeChange(newSize);
    onPageChange(1); // Reset to first page
  };

  // Calculate pagination info
  const pageCount = Math.ceil(totalItems / pagination.pageSize);
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < pageCount - 1;

  return (
    <div className="space-y-4">
      {/* Table content */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} isHeader>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow 
                key={row.id} 
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
            <select
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(1)}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(pagination.pageIndex)}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <button
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(pagination.pageIndex + 2)}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(pageCount)}
              disabled={!canNextPage}
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
