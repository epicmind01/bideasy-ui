import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { useGetActiveBusinessDepartment } from '../../hooks/API/useCommonApis';
import { useGetAllPlantsList } from '../../hooks/API/usePlantMasterApis';
import { useUpdatePurchaseRequestApi, useGetPurchaseRequestByIdApi } from '../../hooks/API/PurchaseRequestApi';
import { formatDate } from '../../Utils/Helpers';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';

// Define types for Product and Purchase Order Details
interface PoDetails {
  title: string;
  organisationId: string;
  companyCodeId: string;
  departmentid: string;
  plantId: string;
  deliveryDate: string;
  contractNumber: string;
  purchaseRequestNumber?: string;
  plantAddress?: string;
  purpose?: string;
  remarks?: string;
  priority: string;
  requisitionType: string;
}

interface ProductItem {
  itemCode: string;
  name: string;
  quantity: number;
  price: number;
  vendorId: string;
  remarks?: string;
  gstPercentage: number;
  MasterGeneric?: {
    name: string;
  };
  MasterCategory?: {
    name: string;
  };
  itemTag?: string;
  unitOfMeasure?: string;
  MasterItemPreviousRecord?: Array<{
    previousCostPrice: number;
    vendorId: string;
    vendor?: {
      tempName: string;
    };
  }>;
}

const PriorityType = ['NORMAL', 'URGENT', 'CRITICAL'];

const EditPurchaseRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [search, setSearch] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [poDetails, setPoDetails] = useState<PoDetails>({
    title: '',
    organisationId: '',
    departmentid: '',
    companyCodeId: '',
    plantId: '',
    deliveryDate: '',
    plantAddress: '',
    purpose: '',
    remarks: '',
    priority: '',
    requisitionType: '',
    contractNumber: '',
    purchaseRequestNumber: ''
  });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 3);
  const minDateString = minDate.toISOString().split('T')[0];

  // Construct searchObj for API call (currently unused but kept for future use)
  // const searchObj = useMemo(() => {
  //   let obj: Record<string, any> = {
  //     previousPrice: true
  //   };
  //   if (search !== '') {
  //     obj.search = search;
  //   }
  //   return obj;
  // }, [search]);

  const { data: purchaseOrder } = useGetPurchaseRequestByIdApi(id || '');

  // Mock data for products - you'll need to implement the actual API
  const productsList = { products: [] };

  // Fetch dynamic select options
  const { data: plants } = useGetAllPlantsList(1, 1000, '');
  const { data: businessDepartments } = useGetActiveBusinessDepartment();

  // API hook for updating purchase request
  const { mutateAsync: updatePurchaseRequest } = useUpdatePurchaseRequestApi();

  useEffect(() => {
    if (purchaseOrder && purchaseOrder?.id) {
      setPoDetails({
        title: purchaseOrder.title,
        organisationId: purchaseOrder.organisationId,
        departmentid: purchaseOrder.departmentid,
        plantId: purchaseOrder.plantId,
        deliveryDate: new Date(purchaseOrder.deliveryDate).toISOString().split('T')[0],
        contractNumber: purchaseOrder.contractNumber,
        companyCodeId: purchaseOrder.companyCodeId,
        purpose: purchaseOrder?.purpose,
        remarks: purchaseOrder?.remarks,
        priority: purchaseOrder?.priority,
        requisitionType: purchaseOrder?.requisitionType
      });

      const selectedProductsList: any[] = [];
      purchaseOrder?.PurchaseRequestItem?.forEach((item: any) => {
        const pitem = item?.item;
        selectedProductsList.push({ ...pitem, quantity: item?.quantity, price: item?.price, vendorId: item?.vendorId, remarks: item?.remarks || '', gstPercentage: item?.gstPercentage || 0 });
      });
      setSelectedProducts(selectedProductsList);
    }
  }, [purchaseOrder]);

  // Validate delivery date (minimum 3 days from today)
  const validateDeliveryDate = (date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    const selectedDate = new Date(date);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3); // Minimum 3 days from today

    return selectedDate >= minDate;
  };

  // Check if delivery date is within 3 days from today
  const isNearDate = (date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    return selectedDate <= threeDaysFromNow && selectedDate >= today;
  };

  // Handle product selection from suggestions
  const handleProductSelect = (product: ProductItem): void => {
    if (selectedProducts.some((p) => p.itemCode === product.itemCode)) {
      toast.error('Product already exists in the table!');
      return;
    }
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1, remarks: '' }]);
    setSearch('');
  };

  // Handle quantity change
  const handleQuantityChange = (itemCode: string, value: string): void => {
    const quantity = parseInt(value) || 0;
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.itemCode === itemCode ? { ...product, quantity } : product
      )
    );
  };

  const handleTaxChange = (itemCode: string, value: number): void => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.itemCode === itemCode ? { ...product, gstPercentage: value } : product
      )
    );
  };

  // Handle remarks change
  const handleRemarksChange = (itemCode: string, value: string): void => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.itemCode === itemCode ? { ...product, remarks: value } : product
      )
    );
  };

  // Handle product removal
  const handleRemoveProduct = (itemCode: string): void => {
    setSelectedProducts((prev) => prev.filter((product) => product.itemCode !== itemCode));
  };

  // Handle purchase order details input
  const handlePoDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    if (name === 'deliveryDate') {
      if (!validateDeliveryDate(value)) {
        toast.error('Delivery date must be at least 3 days from today.');
        return;
      }
      // If the delivery date is within 3 days, set priority to CRITICAL
      if (isNearDate(value)) {
        setPoDetails((prev) => ({ ...prev, priority: 'CRITICAL', [name]: value }));
        toast('Priority set to CRITICAL due to near delivery date.', { icon: '⚠️' });
      } else {
        setPoDetails((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setPoDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Calculate total amount of selected products (currently unused but kept for future use)
  // const calculateTotalAmount = (): number => {
  //   return selectedProducts.reduce((total, product) => {
  //     const unitPrice = product?.MasterItemPreviousRecord?.length > 0
  //       ? product?.MasterItemPreviousRecord[0]?.previousCostPrice || 0
  //       : 0;
  //     return total + (product.quantity * unitPrice);
  //   }, 0);
  // };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    if (
      !poDetails.title ||
      !poDetails.departmentid ||
      !poDetails.plantId ||
      !poDetails.deliveryDate
    ) {
      toast.error('Please fill all required purchase order details.');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product.');
      return;
    }
    if (selectedProducts.some((product) => product.quantity <= 0)) {
      toast.error('All products must have a valid quantity.');
      return;
    }
    if (selectedProducts.some((product) => product.gstPercentage === 0)) {
      toast.error('Please enter GST % for all products.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: poDetails.title,
        organisationId: poDetails.organisationId,
        departmentid: poDetails.departmentid,
        companyCodeId: poDetails.companyCodeId,
        plantId: poDetails.plantId,
        deliveryDate: poDetails.deliveryDate,
        items: selectedProducts.map(item => ({
          ...item,
          remarks: item.remarks || '',
          gstPercentage: item.gstPercentage || 0
        })),
        contractNumber: poDetails.contractNumber,
        plantAddress: poDetails?.plantAddress,
        purpose: poDetails?.purpose,
        remarks: poDetails.remarks,
        priority: poDetails?.priority,
        requisitionType: poDetails?.requisitionType
      };

      if (purchaseOrder?.id) {
        const response = await updatePurchaseRequest({ id: purchaseOrder?.id, ...payload });
        console.log(response);

        if (response.status === 200) {
          toast.success('Purchase Request updated successfully!');
          navigate('/purchase-requests');
          setSelectedProducts([]);
        }
      }
    } catch (error: any) {
      console.error('Error updating purchase request:', error?.data?.message);
      toast.error(error?.response?.data?.message || 'Failed to update purchase request.');
      setIsSubmitting(false);
    }
  };

  // Handle pagination
  const handlePerRowsChange = (newPerPage: number): void => {
    setLimit(newPerPage);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  // Table columns - using simple array format for DataTable component
  const columns = [
    {
      name: 'S.No',
      selector: (row: ProductItem, index?: number) => (index ?? 0) + 1,
    },
    {
      name: 'Item Code / SKU',
      selector: (row: any) => row.itemCode,
    },
    {
      name: 'Name',
      selector: (row: any) => row?.MasterGeneric?.name,
    },
    {
      name: 'Item Tag',
      selector: (row: any) => row?.itemTag,
    },
    {
      name: 'Category',
      selector: (row: any) => row?.MasterCategory?.name,
    },
    {
      name: 'Material Description',
      selector: (row: any) => row?.MasterGeneric?.name,
    },
    {
      name: 'Vendor',
      selector: (row: any) => row?.MasterItemPreviousRecord && row?.MasterItemPreviousRecord?.length > 0 ? row?.MasterItemPreviousRecord[0]?.vendor?.tempName : 'N/A',
    },
    {
      name: 'UOM',
      selector: (row: any) => row?.unitOfMeasure,
    },
    {
      name: 'Unit Price',
      selector: (row: any) => row?.MasterItemPreviousRecord && row?.MasterItemPreviousRecord?.length > 0 ? row?.MasterItemPreviousRecord[0]?.previousCostPrice : 'N/A',
    },
    {
      name: 'GST %',
      cell: (row: ProductItem) => (
        <select
          value={row.gstPercentage}
          onChange={(e) => handleTaxChange(row.itemCode, parseFloat(e.target.value))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
      name: 'Total Price',
      selector: (row: ProductItem) => row?.MasterItemPreviousRecord && row?.MasterItemPreviousRecord?.length > 0 ? Math.round(row.quantity * row?.MasterItemPreviousRecord[0]?.previousCostPrice) : 'N/A',
    },
    {
      name: 'PR Quantity',
      cell: (row: ProductItem) => (
        <input
          type="number"
          min="1"
          value={row.quantity}
          onChange={(e) => handleQuantityChange(row.itemCode, e.target.value)}
          className="border rounded p-1 w-20 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      ),
    },
    {
      name: 'Total',
      selector: (row: ProductItem) => row?.MasterItemPreviousRecord && row?.MasterItemPreviousRecord?.length > 0 ? Math.round(row.quantity * row?.MasterItemPreviousRecord[0]?.previousCostPrice) : 'N/A',
    },
    {
      name: 'Remarks',
      cell: (row: ProductItem) => (
        <textarea
          value={row.remarks || ''}
          onChange={(e) => handleRemarksChange(row.itemCode, e.target.value)}
          placeholder="Enter remarks..."
          className="w-full border rounded p-1 text-sm resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          rows={2}
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row: ProductItem) => (
        <button
          onClick={() => handleRemoveProduct(row.itemCode)}
          className="text-red-500 hover:text-red-700"
        >
          <MdDelete size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader 
        title="Edit PR" 
        subtitle="Edit purchase request details"
        showBackButton={true}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
        {/* Purchase Request Details */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Purchase Request Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">PR Date <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="contractNumber"
                value={formatDate(new Date().toString())}
                readOnly
                disabled
                className="w-full border border-gray-300 rounded-lg py-2 px-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">PR No <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="contractNumber"
                value={purchaseOrder?.purchaseRequestNumber || ''}
                readOnly
                className="w-full border border-gray-300 rounded-lg py-2 px-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Requested By <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="contractNumber"
                value="Current User"
                readOnly
                className="w-full border border-gray-300 rounded-lg py-2 px-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department/Cost Center <span className="text-red-600">*</span></label>
              <select
                value={poDetails.departmentid}
                name="departmentid"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Department</option>
                {businessDepartments && businessDepartments?.length > 0 && businessDepartments.map((option: any) => (
                  <option
                    key={option.id}
                    className='py-3'
                    value={option.id}
                  >
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="title"
                value={poDetails.title}
                onChange={handlePoDetailsChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Enter Title"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select
                value={poDetails.priority}
                name="priority"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Priority</option>
                {PriorityType.map((option: any, index) => (
                  <option
                    key={index}
                    className='py-3'
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Delivery Date <span className="text-red-600">*</span></label>
              <input
                type="date"
                min={minDateString}
                name="deliveryDate"
                value={poDetails.deliveryDate}
                onChange={handlePoDetailsChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Plant ID <span className="text-red-600">*</span></label>
              <select
                value={poDetails.plantId}
                name="plantId"
                onChange={handlePoDetailsChange}
                className="block px-4 py-3 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-auto focus:outline-none focus:ring-0 focus:border-gray-200 peer dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Plant</option>
                {plants && plants?.data?.length > 0 &&
                  plants.data.map((option: any) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Remarks</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={poDetails.remarks}
              onChange={(e) => setPoDetails({ ...poDetails, remarks: e.target.value })}
              placeholder="Enter Remarks"
            />
          </div>
        </div>

        <div className="relative mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Items <span className="text-red-600">*</span></label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {search && productsList && productsList?.products?.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
              {productsList.products.map((product: any) => (
                <div
                  key={product.itemCode}
                  onClick={() => handleProductSelect({ ...product, quantity: 0, price: product?.MasterItemPreviousRecord?.length > 0 ? product?.MasterItemPreviousRecord[0]?.previousCostPrice : 0, vendorId: product?.MasterItemPreviousRecord?.length > 0 ? product?.MasterItemPreviousRecord[0]?.vendorId : '', remarks: '', gstPercentage: 0 })}
                  className="p-3 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 dark:text-white"
                >
                  <span className="font-medium">{product.itemCode}</span> - {product?.MasterGeneric?.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="mb-6">
          <DataTable
            data={selectedProducts}
            columns={columns}
            loading={false}
            rowsPerPageText={limit}
            isServerPropsDisabled={false}
            page={page}
            totalRows={selectedProducts.length}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            selectableRows={false}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-4">
          {isSubmitting ? (
            <Button
              variant="primary"
              disabled
              className="bg-blue-500 text-white py-2 px-6 rounded-lg"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Updating...
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Update
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseRequest;
