import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetPurchaseRequestByIdApi, useApproveOrRejectPurchaseRequestApi } from '../../hooks/API/PurchaseRequestApi';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import { formatDate } from '../../Utils/Helpers';
import Badge from '../../components/ui/badge/Badge';
import { Modal } from '../../components/ui/modal/Modal';
import { useGetActiveCategories } from '../../hooks/API/useCommonApis';
import type { PurchaseRequestItem } from '../../Typings/PurchaseRequestTypes';

// Using the interfaces from types file

interface _PurchaseRequestApproval {
  id: string;
  status: string;
  buyerId: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

const PurchaseRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('APPROVED');
  const [title, setTitle] = useState('Purchase Request Approved');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'arcReady' | 'arcPending' | 'poCreated'>('arcReady');
  const [mainTab, setMainTab] = useState<'pr' | 'po'>('pr');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string }[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedRowData, setSelectedRowData] = useState<PurchaseRequestItem[]>([]);
  const { data: _productCategories } = useGetActiveCategories();

  // Fetch purchase order by ID
  const { data: purchaseOrder, isLoading, error } = useGetPurchaseRequestByIdApi(id || '');
  const approveOrRejectPurchaseRequestReports = useApproveOrRejectPurchaseRequestApi();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load purchase order details.');
    }
  }, [error, navigate]);

  // Filter items based on search and category
  const getFilteredItems = (items: PurchaseRequestItem[]) => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.item?.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item?.MasterBrand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item?.MasterGeneric?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory.length === 0 || selectedCategory.some(category => item.item?.MasterCategory?.name === category.name);

      return matchesSearch && matchesCategory;
    });
  };

  // Handle item selection
  const handleItemSelection = (itemCode: string, isSelected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (isSelected) {
      newSelectedItems.add(itemCode);
    } else {
      newSelectedItems.delete(itemCode);
    }
    setSelectedItems(newSelectedItems);

    // Update selected row data
    const item = purchaseOrder?.PurchaseRequestItem?.find(prItem => prItem.item?.itemCode === itemCode);
    if (item) {
      if (isSelected) {
        setSelectedRowData(prev => [...prev, item]);
      } else {
        setSelectedRowData(prev => prev.filter(prItem => prItem.item?.itemCode !== itemCode));
      }
    }
  };

  // Handle select all items
  const handleSelectAll = (isSelected: boolean) => {
    const currentItems = activeTab === 'arcPending' ? arcPendingItems :
      activeTab === 'arcReady' ? arcReadyItems :
        poCreatedItems;
    const filteredItems = getFilteredItems(currentItems);

    if (isSelected) {
      const allItemCodes = filteredItems.map(item => item.item?.itemCode).filter(Boolean);
      setSelectedItems(new Set(allItemCodes));
      setSelectedRowData(filteredItems);
    } else {
      setSelectedItems(new Set());
      setSelectedRowData([]);
    }
  };

  const handleCreateRfq = () => {
    if (selectedRowData.length === 0) {
      toast.error('Please select at least one item to create RFQ');
      return;
    }

    const items = selectedRowData.map((item: PurchaseRequestItem) => ({
      itemCode: item.item.itemCode,
      annualVolumeQuantity: item.quantity,
    }));

    navigate('/rfq/create', { state: { selectedPrItems: items } });
  };

  const handleApprove = () => {
    if (purchaseOrder?.id) {
      const payload = {
        purchaseRequestId: purchaseOrder.id,
        approvedById: 'current-user-id', // You'll need to get this from context/auth
        status
      };

      setLoading(true);
      console.log(payload);

      approveOrRejectPurchaseRequestReports.mutateAsync(payload)
        .then((res) => {
          setLoading(false);
          console.log('API Response:', res);
          if (res.status === 200 || res.data?.status === 200) {
            toast.success('Purchase Request status updated successfully.');
            setApprovalModalOpen(false);
            // Small delay to ensure modal closes before navigation
            setTimeout(() => {
              navigate(`/purchase-requests`);
            }, 100);
          } else {
            toast.error('Failed to update Purchase Request status.');
            setApprovalModalOpen(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err.response?.data?.message);
          toast.error(err.response?.data?.message || 'An error occurred while updating the Purchase Request.');
          setApprovalModalOpen(false);
        });
    }
  };

  // Table columns for items with selection
  const getColumns = (isSelectable: boolean = false) => {
    const baseColumns = [
      {
        name: 'S.No',
        selector: (row: PurchaseRequestItem, index?: number) => (index ?? 0) + 1,
      },
      {
        name: 'Item Code / SKU',
        selector: (row: PurchaseRequestItem) => row?.item?.itemCode,
      },
      {
        name: 'Name',
        selector: (row: PurchaseRequestItem) => row?.item?.MasterBrand?.name,
      },
      {
        name: 'Item Tag',
        selector: (row: PurchaseRequestItem) => row?.item?.itemTag,
      },
      {
        name: 'Category',
        selector: (row: PurchaseRequestItem) => row?.item?.MasterCategory?.name,
      },
      {
        name: 'Material Description',
        selector: (row: PurchaseRequestItem) => row?.item?.MasterGeneric?.name,
      },
      {
        name: 'Vendor',
        selector: (row: PurchaseRequestItem) => row.item?.MasterItemPreviousRecord && row.item?.MasterItemPreviousRecord?.length > 0 ? row.item?.MasterItemPreviousRecord[row.item?.MasterItemPreviousRecord?.length - 1]?.vendor?.tempName : 'N/A',
      },
      {
        name: 'UOM',
        selector: (row: PurchaseRequestItem) => row?.item?.unitOfMeasure,
      },
      {
        name: 'Unit Price',
        selector: (row: PurchaseRequestItem) => activeTab === 'arcPending' ? row.price : row?.item?.MasterItemPreviousRecord && row?.item?.MasterItemPreviousRecord?.length > 0 ? row.item?.MasterItemPreviousRecord[row.item?.MasterItemPreviousRecord?.length - 1]?.previousCostPrice : 'N/A',
      },
      {
        name: 'GST %',
        selector: (row: PurchaseRequestItem) => row.gstPercentage,
      },
      {
        name: 'PR Quantity',
        selector: (row: PurchaseRequestItem) => row.quantity,
      },
      {
        name: 'Total',
        selector: (row: PurchaseRequestItem) => activeTab === 'arcPending' ? row.quantity * row.price : row?.item?.MasterItemPreviousRecord && row?.item?.MasterItemPreviousRecord?.length > 0 ? Math.round(row.quantity * row.item?.MasterItemPreviousRecord[row.item?.MasterItemPreviousRecord?.length - 1]?.previousCostPrice) : 'N/A',
      },
    ];

    if (isSelectable) {
      return [
        {
          name: 'Select',
          cell: (row: PurchaseRequestItem) => (
            <input
              type="checkbox"
              checked={selectedItems.has(row.item?.itemCode || '')}
              onChange={(e) => handleItemSelection(row.item?.itemCode || '', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          ),
          width: '60px',
        },
        ...baseColumns
      ];
    }

    return baseColumns;
  };

  // Helper function to check if an item has a PO created
  const hasPOCreated = (_prItem: PurchaseRequestItem) => {
    // This would need to be implemented based on your PO data
    return false;
  };

  // Filter items that have PO created
  const poCreatedItems = purchaseOrder?.PurchaseRequestItem?.filter((prItem) => hasPOCreated(prItem)) || [];

  // Filter items based on vendor presence, but exclude items that already have POs created
  const arcReadyItems = purchaseOrder?.PurchaseRequestItem?.filter((item) =>
    item.item?.MasterItemPreviousRecord?.length !== 0 && !hasPOCreated(item)
  ) || [];

  const arcPendingItems = purchaseOrder?.PurchaseRequestItem?.filter((item) =>
    item.item?.MasterItemPreviousRecord?.length === 0 && !hasPOCreated(item)
  ) || [];

  // Get filtered items for current tab
  const getCurrentTabItems = () => {
    const items = activeTab === 'arcReady' ? arcReadyItems :
      activeTab === 'arcPending' ? arcPendingItems :
        poCreatedItems;
    return getFilteredItems(items);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return <div className="p-6 text-center">Purchase Order not found.</div>;
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="Purchase Request Details" 
        subtitle={`PR Number: ${purchaseOrder.purchaseRequestNumber}`}
        showBackButton={true}
      />

      <div className="w-full flex justify-between items-center mt-2">
        <h3 className='text-[1.3rem] font-semibold text-gray-900 dark:text-white'>PR Title : {purchaseOrder?.title}</h3>
        <h3 className='text-[1.3rem] font-semibold text-gray-900 dark:text-white'>PR Number : {purchaseOrder.purchaseRequestNumber}</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-4 mt-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-l-md ${
            mainTab === 'pr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setMainTab('pr')}
        >
          PR Details
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-r-md ${
            mainTab === 'po' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setMainTab('po')}
        >
          Related POs
        </button>
      </div>

      {mainTab === 'pr' && (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
            {/* Purchase Order Metadata */}
            <div className="mb-6">
              <div className='w-full flex justify-between items-center mt-2'>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="font-normal text-gray-700 dark:text-gray-300">Purchase Request Title:</div>
                  <div className="text-gray-900 dark:text-white">{purchaseOrder.title}</div>
                  <div className="font-normal text-gray-700 dark:text-gray-300">Organisation:</div>
                  <div className="text-gray-900 dark:text-white">{purchaseOrder.organisation?.name}</div>
                  <div className="font-normal text-gray-700 dark:text-gray-300">Plant:</div>
                  <div className="text-gray-900 dark:text-white">{purchaseOrder.plant?.name}</div>
                  <div className="font-normal text-gray-700 dark:text-gray-300">Delivery Date:</div>
                  <div className="text-gray-900 dark:text-white">{purchaseOrder.deliveryDate ? formatDate(purchaseOrder.deliveryDate) : ''}</div>
                </div>
                <div className='mt-2'>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-normal text-gray-700 dark:text-gray-300">Date:</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(purchaseOrder.createdAt)}</div>
                    <div className="font-normal text-gray-700 dark:text-gray-300">Department:</div>
                    <div className="text-gray-900 dark:text-white">{purchaseOrder?.department?.name}</div>
                    <div className="font-normal text-gray-700 dark:text-gray-300">Plant Address:</div>
                    <div className="text-gray-900 dark:text-white">{purchaseOrder?.plant?.address}</div>
                    <div className="font-normal text-gray-700 dark:text-gray-300">Status:</div>
                    <div className="text-gray-900 dark:text-white">
                      <Badge variant="light" color="primary" size="sm">{purchaseOrder.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Items</h3>
              <div className="flex mb-4">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    activeTab === 'arcReady'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab('arcReady')}
                >
                  Arc Items ({arcReadyItems.length})
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'arcPending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab('arcPending')}
                >
                  ARC Pending ({arcPendingItems.length})
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    activeTab === 'poCreated'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab('poCreated')}
                >
                  PO Created ({poCreatedItems.length})
                </button>
              </div>

              {/* Filters */}
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                {/* Search Filter */}
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedCategory.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory([]);
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Selection Controls for ARC Pending Items */}
              {(activeTab === 'arcPending' || activeTab === 'poCreated') && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === getCurrentTabItems().length && getCurrentTabItems().length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                    </label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedItems.size} of {getCurrentTabItems().length} items selected
                    </span>
                  </div>
                </div>
              )}

              <DataTable
                data={getCurrentTabItems()}
                columns={getColumns(activeTab === 'arcPending' || activeTab === 'poCreated')}
                loading={false}
                rowsPerPageText={10}
                isServerPropsDisabled={true}
                selectableRows={false}
              />
            </div>
          </div>

          {/* Approval Buttons */}
          {purchaseOrder?.PurchaseRequestApproval && purchaseOrder?.PurchaseRequestApproval?.some((approval) => approval.buyerId === 'current-user-id' && approval.status === 'PENDING') && activeTab === 'arcReady' && (
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setTitle('Purchase Request Accepted');
                  setStatus('APPROVED');
                  setApprovalModalOpen(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700 transition"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTitle('Purchase Request Rejected');
                  setStatus('REJECTED');
                  setApprovalModalOpen(true);
                }}
                className="bg-red-600 text-white px-6 ms-2 py-2 rounded-md text-sm hover:bg-red-700 transition"
              >
                Reject
              </Button>
            </div>
          )}

          {/* Create RFQ button - only show if items are selected */}
          {(activeTab === 'arcPending' || activeTab === 'poCreated') && selectedItems.size > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                onClick={handleCreateRfq}
                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700 transition"
              >
                Create RFQ ({selectedItems.size} items)
              </Button>
            </div>
          )}
        </>
      )}

      {mainTab === 'po' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Related Purchase Orders</h3>
          <div className="text-center text-gray-500 dark:text-gray-400">No related purchase orders found.</div>
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={title}
        confirmText={loading ? 'Processing...' : 'Submit'}
        cancelText="Cancel"
        onConfirm={() => handleApprove()}
        onCancel={() => setApprovalModalOpen(false)}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to {status.toLowerCase()} this Purchase Request?
        </p>
      </Modal>
    </div>
  );
};

export default PurchaseRequestView;
