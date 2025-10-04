import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import { 
  useGetPurchaseOrderByIdApi, 
  useGetASNListByPOId, 
  useGetGRNListByPOId, 
  useGetInvoiceListByPOId, 
  useUpdatePurchaseOrderApi, 
  useUpdateAuctionPurchaseOrderApi 
} from '../../hooks/API/PurchaseOrderApi';
import type { PurchaseRequestItem } from '../../Typings/PurchaseOrderTypes';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { formatDate } from '../../Utils/Helpers';

const PurchaseOrderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [lastBid, setLastBid] = useState<any>(null);

  // Fetch purchase order by ID
  const { data: purchaseOrder, isLoading, error } = useGetPurchaseOrderByIdApi(id || '');
  
  // Type assertion for purchase order data
  const poData = purchaseOrder as any;

  // Fetch related data
  const { data: asnList, isLoading: asnLoading } = useGetASNListByPOId(id || '');
  const { data: grnList, isLoading: grnLoading } = useGetGRNListByPOId(id || '');
  const { data: invoiceList, isLoading: invoiceLoading } = useGetInvoiceListByPOId(id || '');
  const { mutateAsync: updatePurchaseOrder } = useUpdatePurchaseOrderApi();
  const { mutateAsync: updateAuctionPurchaseOrder } = useUpdateAuctionPurchaseOrderApi();

  useEffect(() => {
    if (poData?.auction) {
      const winnerParticipant = poData.auction.participants[0];
      if (winnerParticipant) {
        setLastBid(winnerParticipant?.bidRecords?.[winnerParticipant?.bidRecords?.length - 1]);
      }
    }
  }, [poData]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load purchase order details.');
      navigate('/purchase-order');
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!poData) {
    return <div className="p-6 text-center text-gray-900">Purchase Order not found.</div>;
  }

  const handleUpdatePurchaseOrder = async () => {
    try {
      await updatePurchaseOrder({ id: id || '', status: 'PENDING' } as any);
      toast.success('Purchase order updated successfully!');
      navigate('/purchase-order');
    } catch {
      toast.error('Failed to update purchase order.');
    }
  };

  const handleUpdateAuctionPurchaseOrder = async () => {
    try {
      await updateAuctionPurchaseOrder({ id: id || '', status: 'PENDING' } as any);
      toast.success('Purchase order updated successfully!');
      navigate('/purchase-order');
    } catch {
      toast.error('Failed to update purchase order.');
    }
  };

  // Table columns for items
  const columns = [
    {
      name: 'S.No',
      selector: (_row: PurchaseRequestItem, index?: number) => (index ?? 0) + 1,
    },
    {
      name: 'Item No',
      selector: (row: PurchaseRequestItem) => row.item?.itemCode,
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
      selector: (row: PurchaseRequestItem) => (row?.item as any)?.materialDescription || 'N/A',
    },
    {
      name: 'UOM',
      selector: (row: PurchaseRequestItem) => row.item?.unitOfMeasure,
    },
    {
      name: 'Vendor',
      selector: (_row: PurchaseRequestItem) => poData?.vendor?.tempName || poData?.vendorId,
    },
    {
      name: 'GST %',
      selector: (row: PurchaseRequestItem) => row.tax,
    },
    {
      name: 'Price',
      selector: (row: PurchaseRequestItem) => row.price,
    },
    {
      name: 'Total Quantity',
      selector: (row: PurchaseRequestItem) => row.total,
    },
    {
      name: 'Proceeded Quantity',
      selector: (row: PurchaseRequestItem) => row.quantity,
    }
  ];

  // Tab content components
  const detailsTabContent = (
    <div className="space-y-6">
      {/* PO Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{poData.title}</h2>
            <p className="text-lg text-gray-600">PO Number: {poData.purchaseOrderNumber}</p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded-md text-sm ${
              poData.status === 'DRAFT' ? 'bg-gray-200 text-gray-800' :
              poData.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
              poData.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
              'bg-blue-200 text-blue-800'
            }`}>
              {poData.status}
            </span>
            <p className="text-sm text-gray-500 mt-1">Created: {formatDate(poData.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow transition-shadow duration-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Vendor</h3>
          <p className="text-lg font-semibold text-gray-900">{poData?.vendor?.tempName || 'N/A'}</p>
          <p className="text-sm text-gray-600">{poData.vendor?.email || ''}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
          <p className="text-lg font-semibold text-gray-900">{poData.deliveryAddress || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Date</h3>
          <p className="text-lg font-semibold text-gray-900">
            {poData?.deliveryDate ? formatDate(poData.deliveryDate) : 'Not specified'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Terms</h3>
          <p className="text-lg font-semibold text-gray-900">{poData.paymentTerms || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Terms</h3>
          <p className="text-lg font-semibold text-gray-900">{poData.shippingTerms || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Linked {poData?.purchaseRequest?.purchaseRequestNumber ? 'PR' : 'Auction'}</h3>
          <p className="text-lg font-semibold text-gray-900">
            <a className="text-blue-500 hover:text-blue-600 hover:underline" 
               href={`/${poData?.purchaseRequest?.purchaseRequestNumber ? 'purchase-request' : 'auction'}/${poData?.purchaseRequest?.id || poData?.auction?.id}`}>
              {poData?.purchaseRequest?.purchaseRequestNumber || poData?.auction?.eventCode || 'N/A'}
            </a>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900"> {poData.auctionId ? `Auction Summary` : `Items (${poData.PurchaseOrderItem?.length || 0})`}</h3>
        </div>
        <div className="p-6">
          {poData.auctionId ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 shadow-sm">
                  <thead className="bg-gray-50 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        installation Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Installation Tax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {poData?.auction?.itemsSheets?.map((sheet: any, index: number) => {
                      let sheetPrice = 0;
                      let sheetInstallationPrice = 0;
                      let sheetTax = 0;
                      let sheetInstallationTax = 0;
                      
                      if (lastBid) {
                        sheet.items.forEach((item: any) => {
                          const bidItem = lastBid.bidItems.find((bi: any) => bi.auctionItemId === item.id);
                          if (bidItem) {
                            const quantity = Number(item.data.quantity) || 1;
                            const price = Number(bidItem.price) || 0;
                            const installationPrice = Number(bidItem.installationPrice) || 0;
                            const tax = Number(bidItem.tax) || 0;
                            const installationTax = Number(bidItem.installationTax) || 0;
                            
                            sheetPrice += price;
                            sheetInstallationPrice += installationPrice * quantity;
                            sheetTax += tax;
                            sheetInstallationTax += (quantity * installationTax);
                          }
                        });
                      }
                      
                      const rowTotal = sheetPrice + sheetInstallationPrice + sheetTax + sheetInstallationTax;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sheet.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sheet.items.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            ₹{sheetPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            ₹{sheetInstallationPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            ₹{sheetTax.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            ₹{sheetInstallationTax.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50">
                            ₹{rowTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <DataTable
              data={poData.PurchaseOrderItem || []}
              columns={columns as any}
              pagination={false as any}
            />
          )}
        </div>
      </div>

      {poData?.status === 'DRAFT' && (
        poData?.auctionId ? (
          <div className="flex justify-end">
            <Button
              onClick={() => handleUpdateAuctionPurchaseOrder()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit for Vendor
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              onClick={() => handleUpdatePurchaseOrder()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit for Vendor
            </Button>
          </div>
        )
      )}
    </div>
  );

  const asnTabContent = (
    <div>
      {asnLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : asnList && (asnList as any[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(asnList as any[]).map((asn: any) => (
            <div key={asn.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold">{asn.asnNumber}</h3>
              <p className="text-sm text-gray-600">Status: {asn.status}</p>
              <p className="text-sm text-gray-600">Created: {formatDate(asn.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ASNs Found</h3>
          <p className="text-gray-500">No Advance Shipping Notices have been created for this Purchase Order yet.</p>
        </div>
      )}
    </div>
  );

  const grnTabContent = (
    <div>
      {grnLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : grnList && (grnList as any[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(grnList as any[]).map((grn: any) => (
            <div key={grn.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold">{grn.grnNumber}</h3>
              <p className="text-sm text-gray-600">Status: {grn.status}</p>
              <p className="text-sm text-gray-600">Created: {formatDate(grn.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No GRNs Found</h3>
          <p className="text-gray-500">No Goods Receipt Notes have been created for this Purchase Order yet.</p>
        </div>
      )}
    </div>
  );

  const invoiceTabContent = (
    <div>
      {invoiceLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : invoiceList && (invoiceList as any[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(invoiceList as any[]).map((invoice: any) => (
            <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-gray-600">Status: {invoice.status}</p>
              <p className="text-sm text-gray-600">Created: {formatDate(invoice.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
          <p className="text-gray-500">No Invoices have been created for this Purchase Order yet.</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      id: 'details',
      label: 'PO Details',
      content: detailsTabContent,
    },
    {
      id: 'asn',
      label: 'ASN',
      content: asnTabContent,
      count: (asnList as any[])?.length || 0,
    },
    {
      id: 'grn',
      label: 'GRN',
      content: grnTabContent,
      count: (grnList as any[])?.length || 0,
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: invoiceTabContent,
      count: (invoiceList as any[])?.length || 0,
    },
  ];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-scroll custom-scrollbar px-10 py-5 2xl:p-12 bg-neutral-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <PageHeader title="Purchase Order Details" />
          <nav className="flex space-x-2 text-sm text-gray-500 mt-2">
            <a href="/" className="hover:text-blue-600">Dashboard</a>
            <span>/</span>
            <a href="/purchase-order" className="hover:text-blue-600">Purchase Orders</a>
            <span>/</span>
            <span className="text-gray-900">{poData.purchaseOrderNumber}</span>
          </nav>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to List
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderView;
