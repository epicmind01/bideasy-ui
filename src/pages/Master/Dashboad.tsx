import { useNavigate } from "react-router-dom";
import InfoCard from "./InfoCard";
import { useGetMasterCountApi } from "../../hooks/API/useCommonApis";
import { useState, useEffect } from "react"; // Add useEffect
import ExcelUploadModal from "./ExcelUploadModal";
import { Input } from "../../components/ui/input";
import { Download } from "lucide-react";
import Button from "../../components/ui/button/Button";

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { data: getCardsRecords, refetch, isLoading, isError } = useGetMasterCountApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Add this effect to log the data and trigger refetch on mount
  useEffect(() => {
    console.log("Fetching master data...");
    refetch().then(response => {
      console.log("Master data fetched:", response.data);
    }).catch(error => {
      console.error("Error fetching master data:", error);
    });
  }, [refetch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenExcelModal = () => {
    setIsExcelModalOpen(true);
  };

  const handleCloseExcelModal = () => {
    setIsExcelModalOpen(false);
  };

  // Add loading and error states
  if (isLoading) {
    return <div>Loading master data...</div>;
  }

  if (isError || !getCardsRecords) {
    return <div>Error loading master data. Please try again.</div>;
  }

  const filteredGroups = getCardsRecords.map((group: any) => ({
    ...group,
    items: group.items.filter((item: any) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Master Data Management</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search master data..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-64"
          />
          <Button
            variant="outline"
            onClick={handleOpenExcelModal}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Import/Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredGroups.map((group: any, index: number) => (
          <div key={index} className="space-y-4">
            <h2 className="text-xl font-semibold">{group.groupTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item: any, itemIndex: number) => (
                <InfoCard
                  key={itemIndex}
                  title={item.title}
                  count={item.count}
                  onClick={() => navigate(item.path)}
                  allowPermission={item.allowPermission}
                  icon={item.icon}
                  accentColor={item.accentColor}
                  iconBgColor={item.iconBgColor}
                  subtitle={item.subtitle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={handleCloseExcelModal}
        onSuccess={() => {
          refetch();
          handleCloseExcelModal();
        }}
      />
    </div>
  );
};

export default MasterDashboard;