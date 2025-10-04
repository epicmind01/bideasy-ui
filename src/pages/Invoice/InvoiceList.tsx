import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllInvoicesApi, Invoice } from '../../hooks/API/InvoiceApi';
import toast from 'react-hot-toast';
import { formatDate, hasPermission } from '../../utils/Helpers';
import { ReactTable } from '../../components/ui/table/ReactTable';
import { TopTabs } from '../../components/ui/tabs/TopTabs';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { TitleText } from '../../components/ui/title-text/TitleText';

const BuyersTopTabsData = [
  "All",
  'PENDING', 'ACCEPTED', 'CREDIT_NOTE', 'REJECTED', 'IN_APPROVAL', 'APPROVED', 'COMPLETED'
];

const InvoiceList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  const searchObj = useMemo(() => {
    const obj: Record<string, any> = {};

    if (currentTab > 0) {
      obj.status = BuyersTopTabsData[currentTab].toUpperCase();
    }
    if (search !== "") {
      obj.search = search;
    }
    return obj;
  }, [currentTab, search]);

  const { data, isLoading, error } = useGetAllInvoicesApi(page, limit, searchObj);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load invoices.');
    }
  }, [error]);

  const invoiceColumns = [
    {
      name: 'Invoice Number',
      selector: (row: any) => row.invoiceNumber,
      sortable: true,
      sortField: 'invoiceNumber',
    },
    {
      name: 'Vendor Name',
      selector: (row: any) => row.vendor.tempName,
      sortable: true,
      sortField: 'vendor.tempName',
    },
    {
      name: 'Linked GRN / PO',
      selector: (row: any) => `${row.linkedGRN} / ${row.linkedPO}`,
    },
    {
      name: 'Invoice Amount',
      selector: (row: any) => `${row.invoiceAmount?.toFixed(2) || '0.00'}`,
    },
    {
      name: 'Status',
      selector: (row: Invoice) => (
        <span
          className={`p-2 rounded-md w-[120px] text-center ${
            row.status === 'PENDING'
              ? 'text-yellow-600 bg-yellow-100'
              : row.status === 'APPROVED'
              ? 'text-green-600 bg-green-100'
              : row.status === 'PAID'
              ? 'text-blue-600 bg-blue-100'
              : row.status === 'CREDIT_NOTE'
              ? 'text-green-600 bg-green-100'
              : 'text-orange-600 bg-orange-100'
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
      sortField: 'status',
    },
    {
      name: 'Created Date',
      selector: (row: Invoice) => (row.createdAt ? formatDate(row.createdAt) : '-'),
      sortable: true,
      sortField: 'createdAt',
    },
    {
      name: "Actions",
      cell: (row: Invoice) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {hasPermission("Invoice View") && (
            <MdOutlineRemoveRedEye
              className={`hover:text-blue-600 cursor-pointer`}
              size={16}
              title="View"
              onClick={() => navigate(`/invoice-list/${row.id}`)}
            />
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-5 h-full max-h-full overflow-y-auto custom-scrollbar hide-scrollbar">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full mt-2">
        <div className="p-6">
          <TitleText children="Invoice List" />

          {/* Filters and Search */}
          <div className="flex flex-row gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 flex flex-col h-full py-3 px-6 gap-4">
              <TopTabs
                TopTabsData={BuyersTopTabsData}
                currentStep={currentTab}
                setCurrentStep={setCurrentTab}
              />
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex w-96 border py-2 px-4 border-gray-300 dark:border-gray-600 focus:outline-none focus-within:ring-2 focus-within:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="m-3 bg-white dark:bg-gray-800">
            <ReactTable
              data={data?.invoices || []}
              columns={invoiceColumns}
              loading={isLoading}
              rowsPerPageText={limit}
              isServerPropsDisabled={false}
              page={page}
              totalRows={data?.totalCount}
              onChangeRowsPerPage={setLimit}
              onChangePage={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;

