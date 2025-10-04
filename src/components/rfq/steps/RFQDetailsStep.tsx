import React, { useMemo, useEffect } from 'react';
import { useRFQContext } from '../../../context/RFQContext';
import Button from '../../ui/button/Button';
import { DataTable } from '../../ui/data-table/DataTable';
import SelectedItemsDisplay from '../SelectedItemsDisplay';
import QuantityInput from '../QuantityInput';
import type { ColumnDef } from '@tanstack/react-table';
import {
  useGetBusinessDepartmentsForRFQApi,
} from '../../../hooks/API/useCommonApis';
import {
  useGetProductsForRFQApi,
} from '../../../hooks/API/useCreateRFQApis';

const RFQDetailsStep: React.FC = () => {
  const {
    formData,
    updateFormData,
    selectedRowData,
    selectedItems,
    rowSelection,
    setRowSelection,
    search,
    setSearch,
    page,
    limit,
    selectItem,
    setSelectItem,
    handleQuantityChange,
    handleRowSelectionChange,
    handleClearAll,
    handleRemoveItem,
    handlePerRowsChange,
    handlePageChange,
  } = useRFQContext();

  // API hooks
  const { data: businessDepartments } = useGetBusinessDepartmentsForRFQApi();
  
  const searchObj = useMemo(() => {
    const obj: Record<string, any> = {
      page,
      limit
    };

    if (search !== '') {
      obj.search = search;
    }
    return obj;
  }, [search, limit, page]);

  const { data: products, isLoading: loadingProducts } = useGetProductsForRFQApi(searchObj);

  // Sync row selection with current page data
  useEffect(() => {
    if (products?.data && products.data.length > 0) {
      const newRowSelection: Record<string, boolean> = {};
      
      products.data.forEach((product: any, index: number) => {
        if (selectedItems.has(product.itemCode)) {
          newRowSelection[index.toString()] = true;
        }
      });
      
      // Use a ref to track previous selection to avoid infinite loops
      setRowSelection(prevSelection => {
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
  }, [products?.data, selectedItems, setRowSelection]);

  // Column definitions for products table
  const productColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'itemCode',
      header: 'Code',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('itemCode')}</div>
      ),
    },
    {
      accessorKey: 'itemTag',
      header: 'Tag',
      cell: ({ row }) => {
        const tag = row.getValue('itemTag') as string;
        return (
          <span className="text-sm">
            {tag === 'MARGIN_BASED' ? 'MB' : 'CB'}
          </span>
        );
      },
    },
    {
      accessorKey: 'MasterBrand',
      header: 'Current Brand-Description',
      cell: ({ row }) => {
        const brand = row.original.MasterBrand;
        return (
          <div className="max-w-[200px] truncate">
            {brand?.name || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'MasterGeneric',
      header: 'Generic',
      cell: ({ row }) => {
        const generic = row.original.MasterGeneric;
        return (
          <div className="max-w-[200px] truncate">
            {generic?.name || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'MasterCategory',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.MasterCategory;
        return (
          <div className="max-w-[100px] truncate">
            {category?.name || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'annualVolumeQuantity',
      header: 'Annual Volume Quantity',
      cell: ({ row }) => {
        const itemCode = row.original.itemCode;
        const isSelected = selectedItems.has(itemCode);
        
        if (!isSelected) {
          return <div className="text-gray-400">-</div>;
        }
        
        const selectedItem = selectedRowData.find(item => item.itemCode === itemCode);
        const quantity = selectedItem?.annualVolumeQuantity || 0;
        
        return (
          <QuantityInput
            value={quantity}
            onChange={(value) => handleQuantityChange(row.original, value.toString())}
          />
        );
      },
    },
  ], [selectedItems, selectedRowData, handleQuantityChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div className="relative z-0 w-full mb-5 group">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Select Department
          </label>
          <select
            value={formData.department}
            name="department"
            id="department"
            onChange={handleInputChange}
            className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
          >
            <option>Select Department</option>
            {businessDepartments && businessDepartments?.data?.length > 0 && businessDepartments?.data.map((option: any) => (
              <option
                key={option.id}
                className="py-3"
                value={option.id}
              >
                {option.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative z-0 w-full group">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            RFQ Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
          />
        </div>

        <div className="relative z-0 w-full group">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Buyer Name 
          </label>
          <input
            type="text"
            readOnly
            placeholder="Buyer name"
            value={formData.buyerName}
            className="w-full border bg-gray-200 border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
          />
        </div>

        <div className="relative z-0 w-full mb-2 group">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Select Item Type
          </label>
          <select
            value={formData.itemType}
            name="itemType"
            id="itemType"
            onChange={handleInputChange}
            className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
          >
            <option value="GOODS">Goods</option>
            <option value="SERVICES">Services</option>
            <option value="WORKS">Works</option>
          </select>
        </div>
        
        <div className="relative z-0 w-full mb-2 group">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Select Item 
          </label>
          <div className="flex items-center">
            <input
              type="radio"
              id="autoItemType"
              name="itemType"
              value="AUTO"
              checked={selectItem === 'AUTO'}
              onChange={() => setSelectItem('AUTO')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="autoItemType" className="ml-2 text-sm font-medium text-gray-900 inline-flex items-center mr-4">
              Auto
            </label>
            <input
              type="radio"
              id="manualItemType"
              name="itemType"
              value="manual"
              onChange={() => setSelectItem('MANUAL')}
              checked={selectItem === 'MANUAL'}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="manualItemType" className="ml-2 text-sm font-medium text-gray-900 inline-flex items-center">
              Manual
            </label>
          </div>
        </div>
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
        <h4>Total Items Selected: {selectedItems?.size || 0}</h4>

        <SelectedItemsDisplay
          items={selectedRowData}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
          title="Selected Items"
          itemType="products"
        />

        {/* Product DataTable */}
        <div className="border rounded-lg">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Products</h3>
            <DataTable
              columns={productColumns}
              data={products?.data || []}
              totalItems={products?.total || 0}
              isLoading={loadingProducts}
              onRowSelectionChange={(selection) => handleRowSelectionChange(selection, products?.data)}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePerRowsChange}
              pageSize={limit}
              currentPage={page}
              rowSelection={rowSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQDetailsStep;
