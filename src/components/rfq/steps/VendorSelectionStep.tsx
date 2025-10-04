import React, { useMemo, useEffect } from 'react';
import { useRFQContext } from '../../../context/RFQContext';
import Button from '../../ui/button/Button';
import { DataTable } from '../../ui/data-table/DataTable';
import SelectedItemsDisplay from '../SelectedItemsDisplay';
import type { ColumnDef } from '@tanstack/react-table';
import {
  useGetVendorsForRFQApi,
} from '../../../hooks/API/useCreateRFQApis';

const VendorSelectionStep: React.FC = () => {
  const {
    formData,
    selectedVendorRowData,
    selectedVendorItems,
    vendorRowSelection,
    setVendorRowSelection,
    search,
    setSearch,
    page,
    limit,
    handleVendorRowSelectionChange,
    handlePerRowsChange,
    handlePageChange,
  } = useRFQContext();

  const { data: vendors, isLoading: loadingVendors } = useGetVendorsForRFQApi({
    page: 1,
    limit: 50,
    search: search
  });

  // Vendor column definitions
  const vendorColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'vendorCode',
      header: 'Vendor Code',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('vendorCode') || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'typeOfSupplier',
      header: 'Type of Supplier',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {row.getValue('typeOfSupplier') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'PAN',
      header: 'Pan Number',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('PAN') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.getValue('name') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Vendor Email',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm">
          {row.getValue('email') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'companyOfficeNumber',
      header: 'Contact Number',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('companyOfficeNumber') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm">
          {row.getValue('address') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'overAllApprovalStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('overAllApprovalStatus') as string;
        switch (status) {
          case "APPROVED":
            return (
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-md text-sm">
                Approved
              </span>
            );
          case "PENDING":
            return (
              <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md text-sm">
                Pending
              </span>
            );
          case "REJECTED":
            return (
              <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md text-sm">
                Rejected
              </span>
            );
          case "TEMPORARY":
            return (
              <span className="text-black bg-gray-300 px-2 py-1 rounded-md text-sm">
                Temporary
              </span>
            );
          case "INPROGRESS":
            return (
              <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-md text-sm">
                In Progress
              </span>
            );
          default:
            return <span className="text-gray-600">{status || 'N/A'}</span>;
        }
      },
    },
  ], []);

  // Sync vendor row selection with current page data
  useEffect(() => {
    if (vendors?.vendors && vendors.vendors.length > 0) {
      const newRowSelection: Record<string, boolean> = {};
      
      vendors.vendors.forEach((vendor: any, index: number) => {
        if (formData.selectedVendors.includes(vendor.id)) {
          newRowSelection[index.toString()] = true;
        }
      });
      
      // Use functional update to avoid infinite loops
      setVendorRowSelection(prevSelection => {
        const prevKeys = Object.keys(prevSelection).sort();
        const newKeys = Object.keys(newRowSelection).sort();
        
        // Only update if the selection actually changed
        if (prevKeys.length !== newKeys.length || 
            !prevKeys.every((key, index) => key === newKeys[index])) {
          return newRowSelection;
        }
        
        return prevSelection;
      });
    }
  }, [vendors?.vendors, formData.selectedVendors, setVendorRowSelection]);

  const handleClearAllVendors = () => {
    setSelectedVendorRowData([]);
    setVendorRowSelection({});
    // Update form data through context
    // This should be handled by the context
  };

  const handleRemoveVendor = (vendorId: string) => {
    setSelectedVendorRowData(prev => {
      const updatedVendors = [...prev];
      const index = updatedVendors.findIndex(v => v.id === vendorId);
      if (index >= 0) {
        updatedVendors.splice(index, 1);
        // Update form data through context
        return updatedVendors;
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Select Vendors</h3>
          <p className="text-sm text-gray-600">
            Choose the vendors you want to invite to participate in this RFQ.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {/* Invite New Suppliers - TODO */}}
        >
          + Invite New Suppliers
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {/* Advanced Filter - TODO */}}
        >
          Advanced Filter
        </Button>
        
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex w-96 border py-2 px-4 border-gray-300 focus:outline-none focus-within:ring-2 focus-within:ring-blue-500 bg-white rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-5 w-full py-4 px-5">
        <h4>Total Vendors Selected: {selectedVendorItems?.size || 0}</h4>

        <SelectedItemsDisplay
          items={selectedVendorRowData}
          onRemoveItem={handleRemoveVendor}
          onClearAll={handleClearAllVendors}
          title="Selected Vendors"
          itemType="vendors"
        />

        {/* Vendor DataTable */}
        <div className="border rounded-lg">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Vendors</h3>
            <DataTable
              columns={vendorColumns}
              data={vendors?.vendors || []}
              totalItems={vendors?.total || 0}
              isLoading={loadingVendors}
              onRowSelectionChange={(selection) => handleVendorRowSelectionChange(selection, vendors?.vendors)}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePerRowsChange}
              pageSize={limit}
              currentPage={page}
              rowSelection={vendorRowSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSelectionStep;
