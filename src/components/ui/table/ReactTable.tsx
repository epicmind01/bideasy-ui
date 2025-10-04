import React from 'react';
import { DataTable } from '../data-table/DataTableFixed';

interface ReactTableProps {
  data: any[];
  columns: any[];
  loading?: boolean;
  isServerPropsDisabled?: boolean;
  totalRows?: number;
  onChangeRowsPerPage?: (val: number) => void;
  onChangePage?: (val: number) => void;
  page?: number;
  rowsPerPageText?: number;
}

const ReactTable: React.FC<ReactTableProps> = ({
  data,
  columns,
  loading = false,
  isServerPropsDisabled: _isServerPropsDisabled = false,
  totalRows = 0,
  onChangeRowsPerPage,
  onChangePage,
  page = 1,
  rowsPerPageText = 10,
}) => {
  // Convert columns to the format expected by DataTable
  const convertedColumns = columns.map((col: any) => ({
    accessorKey: col.selector ? col.selector.toString() : col.name.toLowerCase().replace(/\s+/g, '_'),
    header: col.name,
    cell: col.cell || (({ getValue }: any) => getValue()),
    sortable: col.sortable || false,
  }));

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DataTable
          data={data}
          columns={convertedColumns}
          pagination={{
            pageIndex: page - 1,
            pageSize: rowsPerPageText,
            total: totalRows,
          }}
          onPaginationChange={(updater) => {
            if (typeof updater === 'function') {
              const newPagination = updater({ pageIndex: page - 1, pageSize: rowsPerPageText });
              onChangePage?.(newPagination.pageIndex + 1);
              onChangeRowsPerPage?.(newPagination.pageSize);
            }
          }}
        />
      )}
    </div>
  );
};

export { ReactTable };