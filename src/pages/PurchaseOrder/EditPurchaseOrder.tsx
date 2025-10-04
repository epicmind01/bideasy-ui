import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MdDelete, MdHistory } from 'react-icons/md';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import { 
  useGetAllActiveCompanyCodes,
  useGetActiveBusinessDepartment 
} from '../../hooks/API/useCommonApis';
import { useGetAllPlantsList } from '../../hooks/API/usePlantMasterApis';
import { useGetPurchaseOrderByIdApi, useUpdatePurchaseOrderApi } from '../../hooks/API/PurchaseOrderApi';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';

interface PoDetails {
  title: string;
  organisationId: string;
  companyCodeId: string;
  vendorId: string;
  plantId: string;
  deliveryDate?: string;
  contractNumber: string;
}

interface ProductItem {
  id: string;
  itemCode: string;
  name: string;
  quantity: number;
  price?: number;
  vendorId?: string;
  remarks?: string;
  tax?: number;
  item?: any;
}

interface Option {
  id: string;
  name: string;
}

const EditPurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [search, setSearch] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<any>([]);
  const [poDetails, setPoDetails] = useState<PoDetails>({
    title: '',
    organisationId: '',
    companyCodeId: '',
    vendorId: '',
    plantId: '',
    deliveryDate: '',
    contractNumber: '',
  });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Construct searchObj for API call
  const _searchObj = useMemo(() => {
    const obj: Record<string, any> = {
      previousPrice: true,
    };
    if (search !== '') {
      obj.search = search;
    }
    return obj;
  }, [search]);

  // Fetch purchase order by ID
  const { data: purchaseOrder } = useGetPurchaseOrderByIdApi(id || '');
  // Fetch products using the API hook - placeholder for now
  const _productsList = { products: [] };
  const _isFetchingProducts = false;

  // Fetch dynamic select options
  const { data: organisations } = useGetActiveBusinessDepartment();
  const { data: companyCodes } = useGetAllActiveCompanyCodes();
  const { data: plants } = useGetAllPlantsList(1, 1000, '');

  // API hook for updating purchase order
  const { mutateAsync: updatePurchaseOrder } = useUpdatePurchaseOrderApi();

  useEffect(() => {
    if (purchaseOrder && purchaseOrder?.id) {
      setPoDetails({
        title: purchaseOrder.title,
        organisationId: purchaseOrder.organisationId,
        companyCodeId: purchaseOrder.companyCodeId,
        vendorId: purchaseOrder.vendorId,
        plantId: purchaseOrder.plantId,
        contractNumber: purchaseOrder.contractNumber,
      });
      setSelectedProducts(purchaseOrder.PurchaseOrderItem.map((item: any) => ({ 
        ...item, 
        quantity: item.quantity, 
        price: item.price,
        itemCode: item.item.itemCode,
        remarks: item.remarks || ''
      })));
    }
  }, [purchaseOrder]);

  // Handle product selection from suggestions
  const _handleProductSelect = (product: ProductItem): void => {
    if (selectedProducts.some((p: any) => p.itemCode === product.itemCode)) {
      toast.error('Product already exists in the table!');
      return;
    }
    setSelectedProducts([...selectedProducts, { 
      ...product, 
      quantity: 1, 
      price: product?.MasterItemPreviousRecord?.length > 0 ? product?.MasterItemPreviousRecord[0]?.previousCostPrice : 0, 
      vendorId: product?.MasterItemPreviousRecord?.length > 0 ? product?.MasterItemPreviousRecord[0]?.vendorId : '',
      remarks: ''
    }]);
    setSearch('');
  };

  // Handle quantity change
  const handleQuantityChange = (itemCode: string, value: string): void => {
    const updatedProducts = selectedProducts.map((p: any) => {
      if (p.itemCode === itemCode) {
        return { ...p, quantity: parseInt(value, 10) || 0 };
      }
      return p;
    });
    setSelectedProducts(updatedProducts);
  };

  const handlePriceChange = (itemCode: string, value: string): void => {
    const updatedProducts = selectedProducts.map((p: any) => {
      if (p.itemCode === itemCode) {
        return { ...p, price: parseFloat(value) || 0 };
      }
      return p;
    });
    setSelectedProducts(updatedProducts);
  };

  const handleGSTPercentageChange = (itemCode: string, value: number): void => {
    const updatedProducts = selectedProducts.map((p: any) => {
      if (p.itemCode === itemCode) {
        return { ...p, tax: value };
      }
      return p;
    });
    setSelectedProducts(updatedProducts);
  };

  const handleRemarksChange = (itemCode: string, value: string): void => {
    const updatedProducts = selectedProducts.map((p: any) => {
      if (p.itemCode === itemCode) {
        return { ...p, remarks: value };
      }
      return p;
    });
    setSelectedProducts(updatedProducts);
  };

  // Handle product removal
  const handleRemoveProduct = (itemCode: string): void => {
    setSelectedProducts((prev: any) => prev.filter((product: any) => product.itemCode !== itemCode));
  };

  // Handle purchase order details input
  const handlePoDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setPoDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    if (
      !poDetails.title ||
      !poDetails.vendorId 
    ) {
      toast.error('Please fill all the required fields.');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to the purchase order.');
      return;
    }
    if (selectedProducts.some((product: any) => product.quantity <= 0)) {
      toast.error('Quantity must be greater than zero for all products.');
      return;
    }
    if (selectedProducts.some((product: any) => product.tax === 0)) {
      toast.error('Please enter GST % for all products.');
      return;
    }
    setLoading(true);

    const payload = {
      ...poDetails,
      items: selectedProducts.map((p: any) => ({
        id: p.id,
        itemId: p.itemId,
        quantity: p.quantity,
        price: p.price,
        tax: p.tax || 0,
        vendorId: p.vendorId,
        remarks: p.remarks || '',
      })),
    };

    try {
      await updatePurchaseOrder({ id, ...payload });
      toast.success('Purchase order updated successfully!');
      setLoading(false);
      navigate('/purchase-order');
    } catch (error) {
      console.error('Failed to update purchase order:', error);
      setLoading(false);
      toast.error('Failed to update purchase order.');
    }
  };

  // Handle pagination
  const handlePerRowsChange = (newPerPage: number): void => {
    setLimit(newPerPage);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const columns = [
    {
      name: 'S.No',
      selector: (row: any, index?: number) => (index ?? 0) + 1,
    },
    {
      name: 'Item No',
      selector: (row: any) => row.item?.itemCode,
    },
    {
      name: 'Brand',
      selector: (row: any) => row?.item?.MasterGeneric?.name || 'N/A',
    },
    {
      name: 'Generic',
      selector: (row: any) => row?.item?.MasterGeneric?.name || 'N/A',
    },
    {
      name: 'Description',
      selector: (row: any) => row?.item?.materialDescription || 'N/A',
    },
    {
      name: 'UOM',
      selector: (_row: any) => _row.item?.unitOfMeasure,
    },
    {
      name: 'Vendor',
      selector: (row: any) => purchaseOrder?.vendor?.tempName || purchaseOrder?.vendorId,
    },
    {
      name: 'GST %',
      selector: (row: any) => (
        <select
          value={row.tax}
          onChange={(e) => handleGSTPercentageChange(row?.item?.itemCode, parseFloat(e.target.value))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value={0}>Select GST %</option>
          <option value={0}>0%</option>
          <option value={5}>5%</option>
          <option value={12}>12%</option>
          <option value={18}>18%</option>
          <option value={28}>28%</option>
        </select>
      ),
    },
    {
      name: 'PR Price',
      cell: (row: any) => (
        <input
          type="number"
          min="1"
          value={row.price}
          onChange={(e) => handlePriceChange(row?.item?.itemCode, e.target.value)}
          className="border rounded p-1 w-20"
        />
      ),
    },
    {
      name: 'PR Quantity',
      cell: (row: any) => (
        <input
          type="number"
          min="1"
          value={row.quantity}
          onChange={(e) => handleQuantityChange(row?.item?.itemCode, e.target.value)}
          className="border rounded p-1 w-20"
        />
      ),
    },
    {
      name: 'Remarks',
      cell: (row: any) => (
        <input
          type="text"
          value={row.remarks || ''}
          onChange={(e) => handleRemarksChange(row?.item?.itemCode, e.target.value)}
          placeholder="Enter remarks..."
          className="border rounded p-1 w-32"
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row: any) => (
        <button
          onClick={() => handleRemoveProduct(row?.item?.itemCode)}
          className="text-red-500 hover:text-red-700"
        >
          <MdDelete size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-scroll custom-scrollbar px-10 py-5 2xl:p-12 bg-neutral-4">
      <div className="flex justify-between items-center">
        <div>
          <PageHeader title="Update Purchase Order" />
          <p className="text-xl">
            <a href="/" className="text-blue-600">Dashboard</a> /{' '}
            <a href="/purchase-order" className="text-blue-600">Purchase Order List</a> / Update Purchase Order
          </p>
        </div>
        {purchaseOrder?.id && (
          <button
            onClick={() => setShowChangeLogs(!showChangeLogs)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MdHistory size={20} />
            {showChangeLogs ? 'Hide' : 'Show'} Change History
          </button>
        )}
      </div>

      <div className="bg-white flex flex-col px-[1.5rem] py-[1.5em] gap-4 shadow-[rgba(0,_0,_0,_0.02)_0px_1px_3px_0px,_rgba(27,_31,_35,_0.15)_0px_0px_0px_1px]">
        {/* Products Table */}
        <div className="mb-6">
          <DataTable
            data={selectedProducts}
            columns={columns}
            loading={false}
            pagination={true}
            paginationServer={false}
            paginationTotalRows={selectedProducts.length}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            selectableRows={false}
          />
        </div>

        {/* Purchase Order Details */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Purchase Order Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Title</label>
              <input
                type="text"
                name="title"
                value={poDetails.title}
                onChange={handlePoDetailsChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Title"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Organisation ID</label>
              <select
                value={poDetails.organisationId}
                name="organisationId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
              >
                <option value="">Select Organisation</option>
                {organisations && organisations?.data?.length > 0 &&
                  organisations.data.map((option: Option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Company Code ID</label>
              <select
                value={poDetails.companyCodeId}
                name="companyCodeId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
              >
                <option value="">Select Company Code</option>
                {companyCodes && companyCodes?.data?.length > 0 &&
                  companyCodes.data.map((option: Option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Vendor ID</label>
              <select
                value={poDetails.vendorId}
                name="vendorId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
              >
                <option value="">Select Vendor</option>
                {/* Vendors will be loaded from API */}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Plant ID</label>
              <select
                value={poDetails.plantId}
                name="plantId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer"
              >
                <option value="">Select Plant</option>
                {plants && plants?.plants?.length > 0 &&
                  plants.plants.map((option: any) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Contract Number</label>
            <input
              type="text"
              name="contractNumber"
              value={poDetails.contractNumber}
              readOnly
              className="w-full border border-gray-300 rounded-lg py-2 px-4 bg-gray-100"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-4">
          <Button
            disabled={loading}
            onClick={handleSubmit}
            title={loading ? 'Updating...' : 'Update'}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseOrder;
