import TitleText from "../../components/ui/title-text/TitleText";
import { ReactTable } from "../../components/ui/table/ReactTable";
import { useEffect, useState } from "react";
import { useGetAllContractList } from "../../hooks/API/ContractApi";
import CustomSearch from "../../components/ui/search/CustomSearch";
import ContractItemsList from "./ContractItemsList";
import TopTabs from "../../components/ui/tabs/TopTabs";

interface ContractTableData {
  id: string;
  price: number;
  arc: any;
  itemCode: string;
  brandname: string;
  rfg: any;
  createdAt: string;
  createdBy: string;
  arcVendor:{
    tempCompanyName:string
  }
}

const ContractList = () => {
  const [activeTab, setActiveTab] = useState("Contracts");
  const options = [
    { label: "Active", value: "" },
  ];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>('');
  const [limit, setLimit] = useState(10);
  const [filterOption, setFilterOption] = useState<string>("");
  
  const { data: getAllContractApi, refetch, isLoading } = useGetAllContractList(page, limit, search, filterOption);
  const indexColumn = {
    name: "S.No.",
    width: "70px",
    center: true,
    cell: (_row: any, index: number) => <span>{(page - 1) * limit + index + 1}</span>
  };
    
 
  const HEADERS = [
    {
        name: "Price",
      selector: (row: ContractTableData) => row.price,
      sortable: true,
    },
    {
      name: "ARRC",
    selector: (row: ContractTableData) => row.arc,
    sortable: true,
  },
  {
    name: "RFQ ",
  selector: (row: ContractTableData) => row.rfg,
  sortable: true,
},
{
  name: "Item Code",
selector: (row: ContractTableData) => row.itemCode,
sortable: true,
},
{
  name: "Brand Name",
selector: (row: ContractTableData) => row.brandname,
sortable: true,
},
{
  name:'Vendor',
  selector: (row: ContractTableData) => row.arcVendor?.tempCompanyName,
  sortable: true,
},
{
  name: "Created By",
  selector: (row: ContractTableData) => row.createdBy,
  sortable: true,
},
    {
        name: "Created At",
        selector: (row: ContractTableData) => row.createdAt,
        sortable: true,
      },
   

        
        ];
           

  const columnsWithIndex = [indexColumn, ...HEADERS];

  const contractTable = getAllContractApi
  ? getAllContractApi.data.map((item: any) => ({
      id: item.id,
      price: item.price,
      createdBy: item.createdBy?.name || "N/A",
      createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "N/A",      itemCode: item.item?.itemCode || "N/A",
      brandname: item.item?.brand?.name || "N/A",
      rfg: item.rfq?.title || "N/A",
      arc: item.arc?.arcNumber || "N/A",
      

    }))
  : [];

  useEffect(() => {
    refetch();
  }, [ page, limit,search, filterOption, refetch]);
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <TitleText>Contract Management</TitleText>
        <p className="text-gray-600 text-sm mt-1">
          Manage contracts and view contract items approved by vendors
        </p>
          </div>
          
      <TopTabs
        tabs={[
          { name: "Contracts" },
          { name: "Items" }
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="mb-4"
      />

      {activeTab === "Contracts" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="w-64">
              <CustomSearch
                options={options}
                setFilter={(val) => {
                  setFilterOption(val);
                }}
                placeholder={"Search"}
                setSearch={(val) => setSearch(val)}
              />
            </div>
          </div>

          <ReactTable 
            data={contractTable} 
            columns={columnsWithIndex} 
            loading={isLoading}
            isServerPropsDisabled={false}
            totalRows={getAllContractApi?.totalRecords ?? 1}
            onChangeRowsPerPage={(val: number) => setLimit(val)}
            onChangePage={(val: number) => setPage(val)}
            page={page}
            rowsPerPageText={limit}
          />
        </div>
      )}

      {activeTab === "Items" && (
        <ContractItemsList />
      )}
    </div>
  );
};
export default ContractList;