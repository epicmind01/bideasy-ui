import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { 
  useGetAllActiveCompanyCodes,
  useGetActiveBusinessDepartment 
} from '../../hooks/API/useCommonApis';
import { useGetAllPlantsList } from '../../hooks/API/usePlantMasterApis';
import { useCreateManualPOApi } from '../../hooks/API/PurchaseOrderApi';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';

interface ManualPoDetails {
  title: string;
  organisationId: string;
  companyCodeId: string;
  vendorId: string;
  plantId: string;
  deliveryDate?: string;
  estimateDeliveryDate?: string;
  paymentTerms?: string;
  deliveryAddress?: string;
  shippingTerms?: string;
  specialInstructions?: string;
  partialFulfillmentAllowed?: boolean;
  contractNumber: string;
}

interface ProductItem {
  id: string;
  itemCode: string;
  name: string;
  quantity: number;
  price?: number;
  vendorId?: string;
  tax?: number;
  item?: any;
}

interface Option {
  id: string;
  name: string;
}

const CreateManualPO: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [poDetails, setPoDetails] = useState<ManualPoDetails>({
    title: '',
    organisationId: '',
    companyCodeId: '',
    vendorId: '',
    plantId: '',
    deliveryDate: '',
    estimateDeliveryDate: '',
    paymentTerms: '',
    deliveryAddress: '',
    shippingTerms: '',
    specialInstructions: '',
    partialFulfillmentAllowed: false,
    contractNumber: `MANUAL-${Date.now()}`,
  });
  const [_page, setPage] = useState<number>(1);
  const [_limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Fetch products using the API hook - placeholder for now
  const productsList = { products: [] };
  const isFetchingProducts = false;

  // Fetch dynamic select options
  const { data: organisations } = useGetActiveBusinessDepartment();
  const { data: companyCodes } = useGetAllActiveCompanyCodes();
  const { data: plants } = useGetAllPlantsList(1, 1000, '');

  // Create manual PO mutation
  const createManualPO = useCreateManualPOApi();

  // Handle product selection from suggestions
  const handleProductSelect = (product: ProductItem): void => {
    // Check if product already exists in selected products
    const exists = selectedProducts.some((p) => p.id === product.id);
    if (exists) {
      toast.error('Product already added to the list.');
      return;
    }

    // Add product to selected products with default quantity
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: string): void => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === itemId ? { ...product, quantity } : product
      )
    );
  };

  const handleTaxChange = (itemId: string, value: number): void => {
    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === itemId ? { ...product, tax: value } : product
      )
    );
  };

  // Handle price change
  const handlePriceChange = (itemId: string, value: string): void => {
    const price = parseFloat(value);
    if (isNaN(price) || price < 0) return;

    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === itemId ? { ...product, price } : product
      )
    );
  };

  // Handle product removal
  const handleRemoveProduct = (itemId: string): void => {
    setSelectedProducts(selectedProducts.filter((product) => product.id !== itemId));
  };

  // Handle purchase order details input
  const handlePoDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setPoDetails({
        ...poDetails,
        [name]: checkbox.checked,
      });
    } else {
      setPoDetails({
        ...poDetails,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    // Validate required fields
    if (!poDetails.title) {
      toast.error('Please enter a title for the purchase order.');
      return;
    }
    if (!poDetails.organisationId) {
      toast.error('Please select an organisation.');
      return;
    }
    if (!poDetails.companyCodeId) {
      toast.error('Please select a company code.');
      return;
    }
    if (!poDetails.vendorId) {
      toast.error('Please select a vendor.');
      return;
    }
    if (!poDetails.plantId) {
      toast.error('Please select a plant.');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to the purchase order.');
      return;
    }

    // Check if all products have prices
    const missingPrices = selectedProducts.some((product) => !product.price);
    if (missingPrices) {
      toast.error('Please enter prices for all products.');
      return;
    }
    if (selectedProducts.some((product) => !product.tax)) {
      toast.error('Please enter GST % for all products.');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare items for API payload
      const items = selectedProducts.map((product) => ({
        itemId: product.id,
        quantity: product.quantity,
        price: product.price,
        tax: product.tax,
      }));

      // Prepare API payload
      const payload = {
        ...poDetails,
        items,
        createdById: 'current-user-id', // This should come from auth context
      };

      // Call API to create manual PO
      const response = await createManualPO.mutateAsync(payload);
      
      if (response.data && response.data.message) {
        toast.success(response.data.message || 'Purchase order created successfully!');
        navigate('/purchase-order');
      }
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      toast.error(error.response?.data?.message || 'Failed to create purchase order.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const _handlePerRowsChange = (newPerPage: number): void => {
    setLimit(newPerPage);
  };

  const _handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  // Table columns for products
  const columns = [
    {
      name: 'S.No',
      selector: (row: ProductItem, index?: number) => (index ?? 0) + 1,
    },
    {
      name: 'Item Code',
      selector: (row: ProductItem) => row.itemCode,
    },
    {
      name: 'Material Description',
      selector: (row: ProductItem) => row?.item?.MasterGeneric?.name || 'N/A',
    },
    {
      name: 'GST %',
      cell: (row: ProductItem) => (
        <select
          value={row.tax}
          onChange={(e) => handleTaxChange(row.id, parseFloat(e.target.value))}
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
      name: 'Quantity',
      cell: (row: ProductItem) => (
        <input
          type="number"
          min="1"
          value={row.quantity}
          onChange={(e) => handleQuantityChange(row.id, e.target.value)}
          className="w-20 border border-gray-300 rounded-md px-2 py-1"
        />
      ),
    },
    {
      name: 'Price',
      cell: (row: ProductItem) => (
        <input
          type="number"
          min="0"
          step="0.01"
          value={row.price || ''}
          onChange={(e) => handlePriceChange(row.id, e.target.value)}
          className="w-24 border border-gray-300 rounded-md px-2 py-1"
          placeholder="Enter price"
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row: ProductItem) => (
        <button
          onClick={() => handleRemoveProduct(row.id)}
          className="text-red-500 hover:text-red-700"
        >
          <MdDelete size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-scroll custom-scrollbar px-10 py-5 2xl:p-12 bg-neutral-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/purchase-order')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={20} />
        </button>
        <PageHeader title="Create Manual Purchase Order" />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Product Search and Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Add Products</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-4 w-full mr-4"
            />
          </div>

          {/* Product Suggestions */}
          {search && (
            <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {isFetchingProducts ? (
                <div className="p-4 text-center">Loading products...</div>
              ) : productsList && productsList.products && productsList.products.length > 0 ? (
                <ul>
                  {productsList.products.map((product: any) => (
                    <li
                      key={product.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 flex justify-between items-center"
                      onClick={() => handleProductSelect(product as ProductItem)}
                    >
                      <div>
                        <span className="font-medium">{product.itemCode}</span> -{' '}
                        {product.MasterGeneric?.name}
                      </div>
                      <button className="text-blue-500 hover:text-blue-700">Add</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center">No products found</div>
              )}
            </div>
          )}

          {/* Selected Products Table */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Selected Products</h3>
            <DataTable
              data={selectedProducts}
              columns={columns}
              loading={false}
              pagination={false}
              selectableRows={false}
            />
          </div>
        </div>

        {/* Purchase Order Details */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Purchase Order Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">PO Title</label>
              <input
                type="text"
                name="title"
                value={poDetails.title}
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder="Enter purchase order title"
                required
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Organisation</label>
              <select
                value={poDetails.organisationId}
                name="organisationId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-auto focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                required
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
              <label className="block mb-2 text-sm font-medium text-gray-900">Company Code</label>
              <select
                value={poDetails.companyCodeId}
                name="companyCodeId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-auto focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                required
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
              <label className="block mb-2 text-sm font-medium text-gray-900 required">Vendor</label>
              <select
                value={poDetails.vendorId}
                name="vendorId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-auto focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                required
              >
                <option value="">Select Vendor</option>
                {/* Vendors will be loaded from API */}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Plant</label>
              <select
                value={poDetails.plantId}
                name="plantId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-auto focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                required
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
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Estimated Delivery Date</label>
              <input
                type="date"
                name="estimateDeliveryDate"
                value={poDetails.estimateDeliveryDate || ''}
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Payment Terms</label>
              <input
                type="text"
                name="paymentTerms"
                value={poDetails.paymentTerms || ''}
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder="Enter payment terms"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Delivery Address</label>
              <input
                type="text"
                name="deliveryAddress"
                value={poDetails.deliveryAddress || ''}
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder="Enter delivery address"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Shipping Terms</label>
              <input
                type="text"
                name="shippingTerms"
                value={poDetails.shippingTerms || ''}
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder="Enter shipping terms"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900">Contract Number</label>
              <input
                type="text"
                name="contractNumber"
                value={poDetails.contractNumber}
                readOnly
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-gray-100 border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">Special Instructions</label>
            <textarea
              name="specialInstructions"
              value={poDetails.specialInstructions || ''}
              onChange={handlePoDetailsChange}
              className="block px-4 py-3 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder="Enter special instructions"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="partialFulfillmentAllowed"
                name="partialFulfillmentAllowed"
                checked={poDetails.partialFulfillmentAllowed || false}
                onChange={handlePoDetailsChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="partialFulfillmentAllowed" className="ml-2 text-sm font-medium text-gray-900">
                Allow Partial Fulfillment
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-4">
          <Button
            onClick={() => navigate('/purchase-order')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateManualPO;
