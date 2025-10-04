import { IoMdClose } from 'react-icons/io';
import { useState, useEffect } from 'react';
import PrimaryButton from '../../ui/button/PrimaryButton';
import TitleText from '../../ui/title-text/TitleText';
import { useGetAllVendorListApi } from '../../../hooks/API/useRFQApis';
import FlexLoader from '../../ui/loader/FlexLoader';
import CustomDropdown from '../../ui/dropdown/CustomDropdown';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';
interface PreferredVendorForContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess?: () => void;
}

interface PlantWithStatus {
  id: string;
  name: string;
  code: string;
  isPreferred: boolean;
  preferredVendor?: {
    distributorName: string;
    distributorId: string;
    updatedByVendor: boolean;
  } | null;
}

const PreferredVendorForContractModal: React.FC<PreferredVendorForContractModalProps> = ({
  isOpen,
  onClose,
  contractId,
  onSuccess,
}) => {
  const [selectedItemsId, setSelectedItemsId] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<{ [key: string]: string }>({});
  const [plantsWithStatus, setPlantsWithStatus] = useState<PlantWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: distributorList } = useGetAllVendorListApi(
    1, 
    100, 
    '',
    { typeOfSupplier: 'DISTRIBUTOR' }
  );

  // Fetch plants with preferred vendor status
  const fetchPlantsWithStatus = async () => {
    if (!contractId) return;
    
    setIsLoading(true);
    try {
      const response = await axiosClient.get(
        `/contracts/${contractId}/plants-with-status`
      );
      setPlantsWithStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching plants with status:', error);
      toast.error('Failed to fetch plants data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contractId) {
      fetchPlantsWithStatus();
    }
  }, [isOpen, contractId, fetchPlantsWithStatus]);

  // Initialize selected items and input values based on existing preferred vendors
  useEffect(() => {
    const preferredPlants = plantsWithStatus.filter(plant => plant.isPreferred);
    const selectedIds = preferredPlants.map(plant => plant.id);
    const inputValues: { [key: string]: string } = {};
    
    preferredPlants.forEach(plant => {
      if (plant.preferredVendor?.distributorId) {
        inputValues[plant.id] = plant.preferredVendor.distributorId;
      }
    });

    setSelectedItemsId(selectedIds);
    setInputValue(inputValues);
  }, [plantsWithStatus]);

  // Handle individual row selection
  const handleRowSelect = (id: string) => {
    setSelectedItemsId((prev) => {
      const isSelected = prev.includes(id);
      
      if (isSelected) {
        // Unchecking: remove from selected list
        const updatedSelectedIds = prev.filter((itemId) => itemId !== id);
        
        // Clear input
        setInputValue((prevInput) => {
          const { [id]: _, ...rest } = prevInput;
          return rest;
        });
        
        return updatedSelectedIds;
      } else {
        // Checking: add to selected list
        return [...prev, id];
      }
    });
  };

  // Handle input change for distributor selection
  const handleInput = (value: string, key: string) => {
    setInputValue((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // Save preferred vendors
  const handleSave = async () => {
    if (!contractId) return;

    setIsSaving(true);
    try {
      const preferredVendors = selectedItemsId.map(plantId => {
        const distributorId = inputValue[plantId];
        const selectedDistributor = distributorList?.vendors.find((vendor: any) => vendor.id === distributorId);
        const distributorName = selectedDistributor?.name || 
                               selectedDistributor?.email || '';

        return {
          plantCode: plantId,
          distributorName: distributorName || null,
          distributorId: distributorId || null,
          updatedByVendor: false,
        };
      });

      await axiosClient.post(
        `/contracts/${contractId}/preferred-vendors`,
        { body: { preferredVendors } }
      );

      toast.success('Preferred vendors updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving preferred vendors:', error);
      toast.error('Failed to save preferred vendors');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] bg-white flex flex-col rounded-md px-5 py-5 gap-5 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-row justify-between items-center">
        <TitleText>Manage Preferred Vendors</TitleText>
        <IoMdClose
          className="cursor-pointer bg-white text-blue-dark"
          size={20}
          onClick={onClose}
        />
      </div>

      <div className="flex flex-col overflow-y-auto hide-scrollbar my-2 py-2 max-h-[60vh]">
        <table className="w-full my-4 text-gray-500">
          <thead className="text-base text-left font-semibold text-white bg-customBlue-600">
            <tr>
              <th className="px-6 py-3">#</th>
              <th scope="col" className="px-6 py-3 text-sm 2xl:text-xl">
                Plant Name
              </th>
              <th scope="col" className="px-6 py-3 text-sm 2xl:text-xl">
                Plant Code
              </th>
              <th scope="col" className="px-6 py-3 text-sm 2xl:text-xl">
                Distributor Name
              </th>
            </tr>
          </thead>
          <tbody className="border-t-2 border-b-2 text-base">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <FlexLoader />
                </td>
              </tr>
            ) : plantsWithStatus && plantsWithStatus.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No plants available
                </td>
              </tr>
            ) : (
              plantsWithStatus.map((item, index) => (
                <tr
                  key={index}
                  className={`py-2 px-4 border-b ${
                    selectedItemsId?.includes(item.id) ? 'bg-slate-200' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItemsId.includes(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                      className="h-3 w-3 text-customBlue-600 transition duration-150 ease-in-out"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-wrap text-sm 2xl:text-xl">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-wrap text-sm 2xl:text-xl">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-wrap text-sm 2xl:text-xl">
                    {selectedItemsId.includes(item.id) && (
                      <CustomDropdown 
                        options={distributorList?.vendors.map((vendor) => ({ 
                          id: vendor.id, 
                          name: vendor.name || vendor.email 
                        })) || []}
                        label=""
                        placeholder="Select Distributor"
                        additionalClasses="w-full"
                        value={inputValue[item.id] || ''}
                        setValue={(value) => handleInput(value as string, item.id)}
                        multiple={false}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 justify-end">
        <PrimaryButton
          onClick={onClose}
          title="Cancel"
          additionalClasses="px-6 py-2 bg-gray-500 hover:bg-gray-600"
        />
        <PrimaryButton
          onClick={handleSave}
          title={isSaving ? "Saving..." : "Save"}
          additionalClasses="px-6 py-2"
          disable={isSaving}
        />
      </div>
      </div>
    </div>
  );
};

export default PreferredVendorForContractModal;
