import { useApproveInvoice, useInvoiceById, useUpdatePurchaseOrderApi, useGetCreditNotes, useCreateGRNFromInvoice } from '../../hooks/API/InvoiceApi';
import { formatDate } from '../../utils/Helpers';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { useEffect, useState } from 'react';
import { MdOutlineFileDownload } from "react-icons/md";
import { PiFileXlsBold } from "react-icons/pi";
import { FaCheck, FaTimes, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Define Invoice type locally
interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  createdAt: string;
  remarks?: string;
  poId?: string;
  grn?: {
    grnNumber: string;
  };
  vendor?: {
    tempName: string;
    details?: {
      accountHolder?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
    };
  };
  InvoiceItem?: any[];
  InvoiceAttachment?: any[];
  InvoiceApproval?: any[];
}

// Status component for displaying invoice status
const Status = ({ status }: { status: string }) => {
  const lower = status.toLowerCase();
  
  if (lower === 'approved' || lower === 'completed') {
    return <Badge variant="light" color="success" size="sm">{status}</Badge>;
  }
  if (lower === 'pending' || lower === 'in_approval') {
    return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
  }
  if (lower === 'rejected') {
    return <Badge variant="light" color="error" size="sm">{status}</Badge>;
  }
  if (lower === 'credit_note') {
    return <Badge variant="light" color="info" size="sm">{status}</Badge>;
  }
  return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
};

const InvoiceView = () => {
  const navigate = useNavigate();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showRemarks, setShowRemarks] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [isRevisingOrRejecting, setIsRevisingOrRejecting] = useState(false);
  const [showApprovalConfirmation, setShowApprovalConfirmation] = useState(false);
  const [pendingApprovalAction, setPendingApprovalAction] = useState<'APPROVED' | 'REJECTED' | 'REVISED' | null>(null);
  // Mock user data - replace with actual user context/state
  const userId = "1";
  const permissions = ["Invoice View", "Invoice Approve"];
  
  const { id: invoiceId } = useParams<{ id: string }>();
  const { data: invoice, isLoading, error } = useInvoiceById(invoiceId || '');
  
  // Type assertion for invoice data
  const invoiceData = invoice as Invoice | undefined;
  const approveInvoiceMutation = useApproveInvoice();
  const { mutateAsync: updatePurchaseOrder } = useUpdatePurchaseOrderApi();
  const { data: creditNotes } = useGetCreditNotes(invoiceId || '');
  const createGRNFromInvoiceMutation = useCreateGRNFromInvoice();
  const [showGRNCreated, setShowGRNCreated] = useState({
    show: false,
    isPrice: false,
    isQuantity: false,
  });
  
  // Helper function to check if user has approval permission
  const hasApprovalPermission = () => {
    return permissions && permissions.some(permission => 
      permission.toLowerCase().includes('invoice') && 
      permission.toLowerCase().includes('approve')
    );
  };

  // Helper function to check if user can approve (not already approved by them)
  const canApprove = () => {
    if (!hasApprovalPermission()) return false;
    if (!invoiceData?.InvoiceApproval || invoiceData.InvoiceApproval.length === 0) return true;
    
    // Check if current user has already approved
    return !invoiceData.InvoiceApproval.some((approval: any) => 
      approval.buyerId === userId.toString()
    );
  };

  // Helper function to show approval confirmation
  const showApprovalConfirmationDialog = (action: 'APPROVED' | 'REJECTED' | 'REVISED') => {
    setPendingApprovalAction(action);
    setShowApprovalConfirmation(true);
  };

  // Helper function to confirm approval action
  const confirmApprovalAction = () => {
    if (pendingApprovalAction) {
      if (pendingApprovalAction === 'REJECTED' || pendingApprovalAction === 'REVISED') {
        setShowRemarks(true);
        setIsRejecting(pendingApprovalAction === 'REJECTED');
        setIsRevising(pendingApprovalAction === 'REVISED');
      } else {
        handleApproveInvoice(pendingApprovalAction);
      }
    }
    setShowApprovalConfirmation(false);
    setPendingApprovalAction(null);
  };

  // Helper function to cancel approval action
  const cancelApprovalAction = () => {
    setShowApprovalConfirmation(false);
    setPendingApprovalAction(null);
  };
  
  useEffect(() => { 
    if (invoiceData) {
      
      if(['PENDING','REVISED','CREDIT_NOTE','REJECTED'].includes(invoiceData.status)){
        if(invoiceData.InvoiceItem?.some((item: any) => item.comparison?.hasQuantityExceeded)){
          setShowGRNCreated({
            show: true,
            isPrice: false,
            isQuantity: true,
          });
        }
        if(invoiceData.InvoiceItem?.some((item: any) => item.comparison?.hasPriceMismatch)){
          setShowGRNCreated({
            show: true,
            isPrice: true,
            isQuantity: false,
          });
        }
        if(invoiceData.InvoiceItem?.some((item: any) => item.comparison?.hasQuantityExceeded && item.comparison?.hasPriceMismatch)){
          setShowGRNCreated({
            show: true,
            isPrice: true,
            isQuantity: true,
          });
        }
      }
    }
  }, [invoiceData]); 
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !invoiceData) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">Invoice not found</div>
      </div>
    );
  }
  
  const calculateInvoiceSummary = (items: { itemId: string; quantity: number; totalQuantity: number; expiryDate?: string; unitPrice: number; taxRate?: number }[]) => {
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.quantity * item.unitPrice);
    }, 0);

    const totalWithGST = items.reduce((acc, item) => {
      const gstAmount = (item.quantity * item.unitPrice * (item.taxRate || 0)) / 100;
      return acc + (item.quantity * item.unitPrice) + gstAmount;
    }, 0);

    const totalGST = totalWithGST - subtotal;

    return { subtotal, totalGST, orderTotal: totalWithGST };
  };

  const invoiceItems = invoiceData.InvoiceItem?.map((item: any) => ({
    itemId: item.itemId,
    quantity: item.quantity,
    totalQuantity: item.totalQuantity,
    expiryDate: item.expiryDate,
    unitPrice: item.unitPrice,
    taxRate: (item as any).taxRate,
  })) || [];

  const invoiceSummary = calculateInvoiceSummary(invoiceItems);
  
  const handleCreateGRNFromInvoice = async () => {
    try {
      setIsLoadingInvoice(true);
      
      if (!invoiceId) {
        toast.error('Invoice ID not found');
        return;
      }

      await createGRNFromInvoiceMutation.mutateAsync({
        invoiceId: invoiceId,
        remarks: `GRN created from Invoice ${invoiceData?.invoiceNumber}`
      } as any);
      
      toast.success('GRN created successfully from Invoice!');
      navigate('/grn-list');
    } catch (error: any) {
      console.error('Error creating GRN from invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to create GRN from invoice.');
    } finally {
      setIsLoadingInvoice(false);
    }
  };
  const handleApproveInvoice = async (status: 'APPROVED' | 'REJECTED' | 'REVISED') => {
    try {
      setIsLoadingInvoice(true);
      setIsRevisingOrRejecting(true);
      // if (status === 'APPROVED') {
      //     setIsApproving(true);
      // } else if (status === 'REJECTED') {
      //   setIsRejecting(true);
      // } else if (status === 'REVISED') {
      //   setIsRevising(true);
      // } else {
      //   setIsRejecting(true);
      // }
      
      if (!userId) {
        toast.error('User information not found');
        return;
      }

      // Validate required fields for rejection/revision
      if ((status === 'REJECTED' || status === 'REVISED') && !remarks.trim()) {
        toast.error('Please provide remarks for rejection or revision');
        return;
      }
      
      
      await approveInvoiceMutation.mutateAsync({
        invoiceId: invoiceData.id,
        approvedById: userId.toString(),
        status,
        remarks: remarks || undefined
      } as any);
      
      toast.success(`Invoice ${status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'revised'} successfully`);
      setShowRemarks(false);
      setRemarks('');
      setValidationErrors([]);
      setShowValidationErrors(false);
      setIsRevisingOrRejecting(false);
      
      // Navigate back to invoice list
      navigate('/invoice-list');
    } catch (error: any) {
      console.error('Error approving/rejecting invoice:', error);
      
     
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
      setIsRevising(false);
      setIsLoadingInvoice(false);
    }
  };

  const handleEditPO = async () => {
    try {
      setIsLoadingInvoice(true);
      if (!userId) {
        toast.error('User information not found');
        return;
      }
      
      await updatePurchaseOrder({
        id: invoiceData.poId,
        isEditable: true
      } as any);
      
      toast.success(`Purchase Order sent for approval successfully`);
      // Clear validation errors when PO is sent for edit
      setValidationErrors([]);
      setShowValidationErrors(false);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      toast.error('Failed to update purchase order');
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
      setIsLoadingInvoice(false);
    }
  };

  const handleClearValidationErrors = () => {
    setValidationErrors([]);
    setShowValidationErrors(false);
  };

  

  const handleViewAttachment = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadAttachment = (url: string) => {
    window.open(url, '_blank');
  };
  // Define columns for invoice items using modern DataTable format
  const itemColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'item.itemCode',
      header: "Item No",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{row.original.item?.itemCode || 'N/A'}</span>
          {row.original.comparison?.hasQuantityExceeded && (
            <span className="ml-2 text-red-600 font-bold" title="Quantity exceeds remaining PO quantity">🚨</span>
          )}
          {(row.original.comparison?.hasQuantityMismatch || row.original.comparison?.hasPriceMismatch) && !row.original.comparison?.hasQuantityExceeded && (
            <span className="ml-2 text-red-500" title="Data mismatch with PO">⚠️</span>
          )}
        </div>
      )
    },
    { 
      accessorKey: 'item.MasterGeneric.name',
      header: "Material Description",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{getValue() as string || 'N/A'}</span>
    },
    { 
      accessorKey: 'unitPrice',
      header: "Unit Price",
      cell: ({ row }) => (
        <div className={`${row.original.comparison?.hasPriceMismatch ? 'bg-red-100 border border-red-300 rounded px-2 py-1' : ''}`}>
          <div className="text-sm font-medium">₹{row.original.unitPrice?.toFixed(2) || '0.00'}</div>
          {row.original.comparison?.hasPriceMismatch && (
            <div className="text-xs text-red-600">
              PO: ₹{row.original.comparison?.poPrice?.toFixed(2) || '0.00'}
              <span className="ml-1">
                ({row.original.comparison?.priceDiff > 0 ? '+' : ''}₹{row.original.comparison?.priceDiff?.toFixed(2) || '0.00'})
              </span>
            </div>
          )}
        </div>
      )
    },
    { 
      accessorKey: 'quantity',
      header: "Quantity",
      cell: ({ row }) => (
        <div className={`${row.original.comparison?.hasQuantityExceeded && row.original.comparison?.remainingQuantity !== 0 ? 'bg-red-100 border border-red-300 rounded px-2 py-1' : ''}`}>
          <div className="text-sm font-medium">{row.original.quantity}</div>
          {row.original.comparison?.hasQuantityExceeded && row.original.comparison?.remainingQuantity !== 0 && (
            <div className="text-xs text-red-600">
              PO: {row.original.comparison?.remainingQuantity || 0}
              <span className="ml-1">
                ({row.original.comparison?.quantityDiff > 0 ? '+' : ''}{row.original.comparison?.quantityDiff?.toFixed(2) || '0.00'})
              </span>
            </div>
          )}
        </div>
      )
    },
    { 
      accessorKey: 'totalQuantity',
      header: "Total Quantity",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{getValue() as number}</span>
    },
    { 
      accessorKey: 'taxRate',
      header: "GST %",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{(getValue() as number) || 0}%</span>
    },
    { 
      accessorKey: 'batchNumber',
      header: "Batch Number",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{(getValue() as string) || "-"}</span>
    },
    { 
      accessorKey: 'expiryDate',
      header: "Expiry Date",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{(getValue() as string) ? formatDate(getValue() as string) : "-"}</span>
    },
    { 
      accessorKey: 'mrp',
      header: "MRP",
      cell: ({ getValue }) => <span className="text-gray-700 dark:text-gray-300">{(getValue() as number) ? `₹${(getValue() as number).toFixed(2)}` : "-"}</span>
    },
    { 
      id: 'subtotal',
      header: "Subtotal",
      cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">₹{(row.original.quantity * row.original.unitPrice).toFixed(2)}</span>
    },
    { 
      id: 'totalWithGST',
      header: "Total (with GST)",
      cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">₹{(row.original.quantity * row.original.unitPrice * (1 + ((row.original.taxRate || 0) / 100))).toFixed(2)}</span>
    },
  ];

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Invoice</h1>
              <h2>Invoice Number: ${invoice.invoiceNumber}</h2>
            </div>
            <div class="invoice-details">
              <p><strong>Status:</strong> ${invoice.status}</p>
              <p><strong>Created At:</strong> ${invoice.createdAt ? formatDate(invoice.createdAt) : '-'}</p>
              <p><strong>Remarks:</strong> ${invoice.remarks || '-'}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Item Code</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>GST %</th>
                  <th>Batch No.</th>
                  <th>Expiry Date</th>
                  <th>MRP</th>
                  <th>Subtotal</th>
                  <th>Total (with GST)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.InvoiceItem.map(item => {
                  const itemWithNewFields = item as any;
                    const quantityStyle = itemWithNewFields.comparison?.hasQuantityExceeded 
                    ? 'background-color: #fecaca; border: 2px solid #dc2626; font-weight: bold;' 
                   
                    : '';
                  const priceStyle = itemWithNewFields.comparison?.hasPriceMismatch ? 'background-color: #fecaca; border: 2px solid #dc2626;' : '';
                  
                  return `
                  <tr>
                    <td>${item.item?.MasterGeneric?.name || 'N/A'} ${itemWithNewFields.comparison?.hasQuantityExceeded  || itemWithNewFields.comparison?.hasPriceMismatch ? '🚨'  : ''}</td>
                    <td>${item.item?.itemCode || 'N/A'}</td>
                    <td style="${quantityStyle}">
                      ${item.quantity}
                      ${itemWithNewFields.comparison?.hasQuantityExceeded  ? `<br><small style="color: #dc2626;">Remaining: ${itemWithNewFields.comparison?.remainingQuantity || 0}</small>` : ''}
                    </td>
                    <td style="${priceStyle}">
                      ₹${item.unitPrice.toFixed(2)}
                      ${itemWithNewFields.comparison?.hasPriceMismatch ? `<br><small style="color: #dc2626;">PO: ₹${itemWithNewFields.comparison?.poPrice?.toFixed(2) || '0.00'}</small>` : ''}
                    </td>
                    <td>${itemWithNewFields.taxRate || 0}%</td>
                    <td>${itemWithNewFields.batchNumber || '-'}</td>
                    <td>${item.expiryDate ? formatDate(item.expiryDate) : '-'}</td>
                    <td>${itemWithNewFields.mrp ? `₹${itemWithNewFields.mrp.toFixed(2)}` : '-'}</td>
                    <td>₹${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td>₹${(item.quantity * item.unitPrice * (1 + (itemWithNewFields.taxRate || 0) / 100)).toFixed(2)}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            <div class="summary">
              <p><strong>Subtotal:</strong> ₹${invoiceSummary.subtotal.toFixed(2)}</p>
              <p><strong>Total GST:</strong> ₹${invoiceSummary.totalGST.toFixed(2)}</p>
              <p><strong>Total:</strong> ₹${invoiceSummary.orderTotal.toFixed(2)}</p>
              ${creditNotes && creditNotes.length > 0 ? `
                <p><strong>Credit Notes:</strong> -₹${creditNotes.reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0).toFixed(2)}</p>
                <p><strong>Net Amount:</strong> ₹${(invoiceSummary.orderTotal - creditNotes.reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0)).toFixed(2)}</p>
              ` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6">
        <PageHeader 
        title={`Invoice ${invoiceData.invoiceNumber}`}
        subtitle="View and manage invoice details"
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintInvoice}
            className="flex items-center"
          >
            <MdOutlineFileDownload className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center"
          >
            <PiFileXlsBold className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </PageHeader>

      {/* Invoice Header Card */}
      <div className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-brand-200 dark:border-brand-800 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">INV-{invoiceData.invoiceNumber}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">From GRN-{invoiceData.grn?.grnNumber || 'N/A'}</p>
          </div>
          <div className="text-right">
            <Status status={invoiceData.status} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Created: {formatDate(invoiceData.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Vendor</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{invoiceData.vendor?.tempName || 'N/A'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">GRN Reference</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{invoiceData.grn?.grnNumber || 'N/A'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Remarks</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{invoiceData.remarks || 'No remarks'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Subtotal</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{invoiceSummary.subtotal.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total GST</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{invoiceSummary.totalGST.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Amount</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{invoiceSummary.orderTotal.toFixed(2)}</p>
          {creditNotes && (creditNotes as any[]).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-red-600 dark:text-red-400">
                Credit Notes: -₹{(creditNotes as any[]).reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0).toFixed(2)}
              </p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                Net Amount: ₹{(invoiceSummary.orderTotal - (creditNotes as any[]).reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0)).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items Count</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{invoiceData.InvoiceItem?.length || 0} items</p>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Items ({invoiceData.InvoiceItem?.length || 0})</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <DataTable
              columns={itemColumns}
              data={invoiceData.InvoiceItem || []}
              totalItems={invoiceData.InvoiceItem?.length || 0}
              isLoading={false}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              rowSelection={{}}
              onRowSelectionChange={() => {}}
              pageSize={10}
              currentPage={1}
            />
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bank Account Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Holder:</span>
              <span className="text-sm text-gray-900 dark:text-white">{invoiceData.vendor?.details?.accountHolder || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name:</span>
              <span className="text-sm text-gray-900 dark:text-white">{invoiceData.vendor?.details?.bankName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number:</span>
              <span className="text-sm text-gray-900 dark:text-white">{invoiceData.vendor?.details?.accountNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IFSC Code:</span>
              <span className="text-sm text-gray-900 dark:text-white">{invoiceData.vendor?.details?.ifscCode || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Attachments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Attachments</h3>
        </div>
        <div className="p-6">
          {invoiceData.InvoiceAttachment?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoiceData.InvoiceAttachment.map((attachment: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Attachment {index + 1}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{attachment.fileName || "Document"}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAttachment(attachment.fileUrl)}
                        className="text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/50"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                        className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/50"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📎</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Attachments</h3>
              <p className="text-gray-500 dark:text-gray-400">No attachments have been uploaded for this invoice.</p>
            </div>
          )}
        </div>
      </div>

      {/* Credit Notes Section - Show when invoice is revised */}
      {creditNotes && (creditNotes as any[]).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Credit Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {creditNotes && (creditNotes as any[]).length > 0 
                ? 'Credit notes created for this revised invoice.' 
                : 'This invoice has been revised. Credit notes may be created by the vendor to adjust the amount.'
              }
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(creditNotes as any[]).map((creditNote: any, index: number) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-md font-medium text-green-900 dark:text-green-100">
                          Credit Note #{creditNote.creditNoteNumber || `CN-${index + 1}`}
                        </h4>
                        <Badge variant="light" color="success" size="sm">
                          {creditNote.status || 'ACTIVE'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <span className="font-medium">Amount:</span> ₹{creditNote.amount?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            <span className="font-medium">Reason:</span> {creditNote.reason}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="font-medium">Created:</span> {creditNote.createdAt ? formatDate(creditNote.createdAt) : 'N/A'}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="font-medium">Vendor:</span> {creditNote.vendor?.tempName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-md font-medium text-blue-900 dark:text-blue-100">Credit Note Summary</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Total credit notes: {(creditNotes as any[]).length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      Total Credit Amount: ₹{(creditNotes as any[]).reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Net Invoice Amount: ₹{(invoiceSummary.orderTotal - (creditNotes as any[]).reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Section */}
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6 shadow-sm">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100">⚠️ Data Mismatch Errors</h3>
              <button
                onClick={() => setShowValidationErrors(false)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                The invoice cannot be approved due to the following data mismatches with the Purchase Order:
              </p>
            </div>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-red-200 dark:border-red-800">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                <strong>Action Required:</strong> Please contact the vendor to correct these mismatches or use the "Send Edit PO" button to request changes to the Purchase Order.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleClearValidationErrors}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Clear Errors & Retry
                </Button>
                <Button
                  onClick={() => handleEditPO()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Send Edit PO
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Approval Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Actions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {showRemarks && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleApproveInvoice(isRejecting ? 'REJECTED' : 'REVISED')}
                    disabled={isRevisingOrRejecting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {isRejecting && 'Confirm Rejection'}
                    {isRevising && 'Confirm Revision'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRemarks(false);
                      setRemarks('');
                    }}
                    disabled={isRevisingOrRejecting}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {
              invoiceData.status !== 'COMPLETED' && (
                <div className="flex space-x-3">
                  {
                    (!showGRNCreated.isQuantity && !showGRNCreated.isPrice && invoiceData?.grn) && invoiceData.InvoiceApproval?.some((approval: any) => approval.status === 'PENDING' && (approval.buyerId === userId || approval.departmentId === userId)) && (
                      <Button
                        variant="primary"
                        onClick={() => showApprovalConfirmationDialog('APPROVED')}
                        disabled={isApproving || isRejecting || isLoadingInvoice}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        {isApproving ? 'Approving Invoice...' : 'Approve Invoice'}
                      </Button>
                    )
                  }
                  {
                    !invoiceData?.grn && (
                      <Button
                        variant="primary"
                        onClick={() => handleCreateGRNFromInvoice()}
                        disabled={createGRNFromInvoiceMutation.isPending || isLoadingInvoice}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        {createGRNFromInvoiceMutation.isPending ? 'Creating GRN...' : 'Create GRN from Invoice'}
                      </Button>
                    )
                  }
                  
                  {
                    (showGRNCreated.isQuantity || showGRNCreated.isPrice) && (
                      <Button
                        onClick={() => handleEditPO()}
                        variant="primary"
                        disabled={isApproving || isRejecting || isLoadingInvoice}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Send Edit PO
                      </Button>
                    )
                  }
                  {
                    !showGRNCreated.isQuantity && showGRNCreated.isPrice && (
                      <Button
                        onClick={() => {setShowRemarks(true); setIsRevising(true)}}
                        variant="outline"
                        disabled={isApproving || isRejecting || showRemarks || isLoadingInvoice}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Revise Invoice
                      </Button>
                    )
                  }
                
                  <Button
                    variant="outline"
                    onClick={() => {setShowRemarks(true); setIsRejecting(true)}}
                    disabled={isApproving || isRejecting || showRemarks || isLoadingInvoice}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Reject Invoice
                  </Button>
                </div>
              )
            }
          </div>
          
          {/* Approval History Section */}
          <div className="space-y-4">
            {invoiceData.InvoiceApproval && invoiceData.InvoiceApproval.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Approval History</h4>
                <div className="space-y-3">
                  {invoiceData.InvoiceApproval.map((approval: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                      <div className="flex-shrink-0">
                        {approval.status === 'APPROVED' ? (
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <FaCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : approval.status === 'REJECTED' ? (
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <FaTimes className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <FaHistory className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {approval.buyer?.name || approval.department?.name || 'Unknown User'}
                          </span>
                          <Badge 
                            variant="light" 
                            color={
                              approval.status === 'APPROVED' ? 'success' : 
                              approval.status === 'REJECTED' ? 'error' : 'warning'
                            } 
                            size="sm"
                          >
                            {approval.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(approval.createdAt)}
                        </div>
                        {(approval as any).remarks && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="font-medium">Remarks:</span> {(approval as any).remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Confirmation Dialog */}
      {showApprovalConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pendingApprovalAction === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30' :
                pendingApprovalAction === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {pendingApprovalAction === 'APPROVED' ? (
                  <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : pendingApprovalAction === 'REJECTED' ? (
                  <FaTimes className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <FaHistory className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm {pendingApprovalAction === 'APPROVED' ? 'Approval' : 
                        pendingApprovalAction === 'REJECTED' ? 'Rejection' : 'Revision'}
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {pendingApprovalAction === 'APPROVED' && 
                  'Are you sure you want to approve this invoice? This action cannot be undone.'}
                {pendingApprovalAction === 'REJECTED' && 
                  'Are you sure you want to reject this invoice? You will need to provide a reason.'}
                {pendingApprovalAction === 'REVISED' && 
                  'Are you sure you want to revise this invoice? You will need to provide a reason.'}
              </p>
              {invoiceData && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Invoice:</span> {invoiceData.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Vendor:</span> {invoiceData.vendor?.tempName || 'N/A'}
                    </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Amount:</span> ₹{invoiceSummary.orderTotal.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={confirmApprovalAction}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pendingApprovalAction === 'APPROVED' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : pendingApprovalAction === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {pendingApprovalAction === 'APPROVED' ? 'Approve' : 
                 pendingApprovalAction === 'REJECTED' ? 'Reject' : 'Revise'}
              </Button>
              <Button
                onClick={cancelApprovalAction}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;