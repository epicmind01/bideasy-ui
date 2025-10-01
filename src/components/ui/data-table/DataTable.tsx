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
    getFilteredRowModel
  } from '@tanstack/react-table';
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
  import { format } from 'date-fns';
  import { useState, useEffect } from 'react';
  import type { ReactNode } from 'react';
  import Button from '../button/Button';
  
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
  
  function DataTable<TData>({
    columns,
    data = [],
    totalItems = 0,
    isLoading = false,
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
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
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
    onPageChange(0); // Reset to first page

        {/* Table content */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg">
{{ ... }}
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
                  onClick={(e) => {
                    // Only trigger row click if the click is not on a checkbox
                    const target = e.target as HTMLElement;
                    if (!target.closest('input[type="checkbox"]')) {
                      onRowClick?.(row.original);
                    }
                  }}
                  className={onRowClick ? 'cursor-pointer' : ''}
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

          {/* Pagination */}
          <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 gap-4">
              <div className="flex-1 flex items-center gap-4">
                {/* Show entries selector */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Show</span>
                  <select
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    className="h-8 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {[10, 20, 30, 50, 100].map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>entries per page</span>
                </div>

                {/* Records info */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">
                    {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}
                  </span> of <span className="font-medium">{totalItems}</span> records
                </div>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1">

            
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center m-0 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700"
                onClick={() => handlePageChange(0)}
                disabled={pagination.pageIndex === 0}
                title="First page"
              >
                <ChevronsLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center m-0 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700"
                onClick={() => handlePageChange(pagination.pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                title="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center h-10 gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(totalItems / pagination.pageSize)) }, (_, i) => {
                const pageNumber = i + Math.max(0, Math.min(
                  pagination.pageIndex - 2,
                  Math.ceil(totalItems / pagination.pageSize) - 5
                ));
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.pageIndex ? 'primary' : 'outline'}
                    size="sm"
                    className={`h-10 w-10 flex items-center justify-center m-0 ${
                      pageNumber === pagination.pageIndex 
                        ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-600/30 dark:text-white dark:hover:bg-brand-700/40' 
                        : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber + 1}
                  </Button>
                );
              })}
            </div>
            
            
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center m-0 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700"
                onClick={() => handlePageChange(pagination.pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                title="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center m-0 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700"
                onClick={() => handlePageChange(Math.ceil(totalItems / pagination.pageSize) - 1)}
                disabled={!table.getCanNextPage()}
                title="Last page"
              >
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Helper component for date formatting
  interface DateCellProps {
    date: string;
  }
  
  export const DateCell = ({ date }: DateCellProps) => {
    try {
      return <span>{format(new Date(date), 'MMM dd, yyyy hh:mm a')}</span>;
    } catch {
      return <span>Invalid date</span>;
    }
  };
  
  export default DataTable;