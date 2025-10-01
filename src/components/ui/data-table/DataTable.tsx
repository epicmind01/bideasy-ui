import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    flexRender,
    getFilteredRowModel,
  } from '@tanstack/react-table';
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
  import { format } from 'date-fns';
  import { useState, useEffect } from 'react';
  import type { ReactNode } from 'react';
  import Button from '../button/Button';
  
  // Table components
  const Table = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
  
  const TableHeader = ({ children }: { children: ReactNode }) => (
    <thead className="bg-brand-100 dark:bg-brand-600/30 [&_th]:font-semibold [&_th]:text-gray-800 dark:[&_th]:text-white [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_th]:text-sm">
      {children}
    </thead>
  );
  
  const TableBody = ({ children }: { children: ReactNode }) => (
    <tbody className="[&_td]:py-3 [&_td]:px-4 [&_td]:text-sm [&_td]:text-gray-700 dark:[&_td]:text-gray-300 bg-white dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700/50">
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
    onRowClick?: (row: TData) => void;
    pageSize?: number;
    currentPage?: number;
  }
  
  function DataTable<TData>({
    columns,
    data = [],
    totalItems = 0,
    isLoading = false,
    onPageChange,
    onRowClick,
    pageSize: externalPageSize = 10,
    currentPage: externalCurrentPage = 1,
  }: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: externalCurrentPage - 1, // 0-based for internal use
      pageSize: externalPageSize,
    });
    const [currentPage, setCurrentPage] = useState<number>(externalCurrentPage);
  
    // Update internal state when external props change
    useEffect(() => {
      setPagination(prev => ({
        ...prev,
        pageIndex: externalCurrentPage - 1,
        pageSize: externalPageSize,
      }));
      setCurrentPage(externalCurrentPage);
    }, [externalCurrentPage, externalPageSize]);
  
    // Initialize table
    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnFilters,
        pagination: {
          pageIndex: Math.max(0, Math.min(pagination.pageIndex, Math.ceil(totalItems / pagination.pageSize) - 1)),
          pageSize: pagination.pageSize,
        },
      },
      pageCount: Math.ceil(totalItems / pagination.pageSize) || 1,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onPaginationChange: (updater) => {
        const newPagination = updater instanceof Function ? updater({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }) : updater;
        
        const newPageIndex = Math.max(0, Math.min(newPagination.pageIndex, Math.ceil(totalItems / newPagination.pageSize) - 1));
        
        setPagination({
          pageIndex: newPageIndex,
          pageSize: newPagination.pageSize,
        });
        
        setCurrentPage(newPageIndex + 1);
        onPageChange?.(newPageIndex + 1);
      },
      manualPagination: true,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });
  
    const handlePageChange = (pageIndex: number) => {
      const newPageIndex = Math.max(0, Math.min(pageIndex, Math.ceil(totalItems / pagination.pageSize) - 1));
      setPagination(prev => ({
        ...prev,
        pageIndex: newPageIndex,
      }));
      setCurrentPage(newPageIndex + 1);
      onPageChange?.(newPageIndex + 1);
    };
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        <div className="rounded-md border dark:border-gray-700">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-brand-50/50 dark:hover:bg-gray-800/80`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
  
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-b-lg border-t border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Showing <span className="font-medium">
              {pagination.pageIndex * pagination.pageSize + 1} -{' '}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalItems
              )}
            </span> of <span className="font-medium">{totalItems}</span> results
          </div>
          
          <div className="flex items-center h-full gap-2">
            <div className="flex items-center h-10 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center m-0 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/80 border-gray-200 dark:border-gray-700"
                onClick={() => handlePageChange(0)}
                disabled={!table.getCanPreviousPage()}
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
            
            <div className="flex items-center gap-1">
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