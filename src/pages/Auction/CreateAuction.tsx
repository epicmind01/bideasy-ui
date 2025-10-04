import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import { Input } from '../../components/ui/input';
import { Stepper } from '../../components/ui/stepper/Stepper';
import { cn } from '../../lib/utils';
import Select from '../../components/form/Select';
import MultiSelect from '../../components/form/MultiSelect';
import FileInput from '../../components/form/input/FileInput';
import { Editor } from '../../components/editor/Editor';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { 
  useGetActiveAuctionCategories, 
  useGetAllActivePlants,
  useGetActiveBuyers 
} from '../../hooks/API/useCommonApis';

// Define the steps for the stepper
const steps = [
  { id: 'auction-info', name: 'Auction Info' },
  { id: 'auction-behavior', name: 'Auction Behavior' },
  { id: 'item-info', name: 'Item Info' },
  { id: 'participants', name: 'Participants' },
  { id: 'schedule', name: 'Schedule' },
];

// Types for form data
type FormData = {
  // Step 1: Auction Info
  name: string;
  status: string;
  eventCode: string;
  eventCategory: string;
  businessDepartment: string;
  coCreators: string[];
  observers: string[];
  termsAndConditions: string;
  plantId: string;
  eventDocuments: File[];
  vendorDocuments: File[];
  images: File[];

  // Step 2: Auction Behavior
  auctionBehavior: string,  // 1.Project Auction  2.English Auction  3.Dutch Auction  4.Bidding  5.Indicative Auction checkbox
  predefinedTemplate: boolean, // 1. YES  2. NO 
  templateId: string,  // comes from api if predefinedTemplate is true then show
  displayleadingprice: boolean, //Yes/No
  HasFirstQuote: boolean, // Yes/No
  leadingPrice: number, // if HasFirstQuote is true then show
  canBidAgainst: string, // 1. Leading Price  2. Vendor Self Price checkbox
  mcdPrice: number,
  minimumBDPrice: number, // Yes/No
  hasMaxBidDiff: boolean, // Yes/No
  maxBidDiffPrice: number, // if hasMaxBidDiff is true then show
  minBidDifferenceContractors: number,
  minBidDifferenceSelf: number,
  canMatchLeadingVendorsPrice: boolean,
  hasReservedBuyingOrSelling: string, // 1. INDICATIVE  2. STOP_FURTHER_BIDDING  3.NOT_APPLICABLE checkbox
  reserveBuyingSellingPrice: number, // if hasReservedBuyingOrSelling is STOP_FURTHER_BIDDING or INDICATIVE then show
  canDisplayParticipationRank: string, // 1. SHOW_TO_ALL  2. SHOW_ONLY_TO_LEADING_VENDORS  3.NOT_REQUIRED checkbox
  isSingleBid: boolean, //Yes/No
  isVendorCompanyNameMasked: boolean, //Yes/No
  isVendorBidPriceMasked: boolean, //Yes/No  
  winnerAnnounced: string, // 1. MANUAL  2. AUTOMATIC    checkbox
  

  // Step 3: Auction Items
  itemSheets: [],
  itemsSheet: [],
  itemType: string,

  // Step 4: Vendor Selection
  allSelected: boolean,
  selectedRows: [],

  // Step 5: Auction Schedule
  extension: number,
  startTime: string,
  endTime: string,
  isAutoExtension: boolean,
  lastBidExtension: number,
  overallExtension: number,
  scheduleBehaviour: string,

};

// Type for select options
type OptionType = {
  value: string;
  label: string;
  text?: string;
  selected?: boolean;
};

// Type for MultiSelect options
type MultiSelectOption = {
  value: string;
  text: string;
  selected: boolean;
};

const CreateAuction: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define breadcrumbs for the page header
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Auctions', href: '/auction' },
    { label: 'Create Auction', active: true }
  ];

  const [formData, setFormData] = useState<FormData>({
    // Step 1: Auction Info
    name: '',
    status: '',
    eventCode: '',
    eventCategory: '',
    businessDepartment: '',
    coCreators: [],
    observers: [],
    termsAndConditions: '',
    plantId: '',
    eventDocuments: [],
    vendorDocuments: [],
    images: [],

    // Step 2: Auction Behavior
    auctionBehavior: '',
    predefinedTemplate: false,
    templateId: '',
    displayleadingprice: false,
    HasFirstQuote: false,
    canBidAgainst: '',
    mcdPrice: 0,
    minimumBDPrice: 0,
    hasMaxBidDiff: false,
    minBidDifferenceContractors: 0,
    minBidDifferenceSelf: 0,
    maxBidDiffPrice: 0,
    canMatchLeadingVendorsPrice: false,
    hasReservedBuyingOrSelling: '',
    canDisplayParticipationRank: '',
    reserveBuyingSellingPrice: 0,
    isSingleBid: false,
    isVendorCompanyNameMasked: false,
    isVendorBidPriceMasked: false,
    leadingPrice: 0,
    winnerAnnounced: '',

    // Step 3: Auction Items
    itemSheets: [],
    itemsSheet: [],
    itemType: '',
    // Step 4: Vendor Selection
    allSelected: false,
    selectedRows: [],
    


    // Step 5: Auction Schedule
    extension: 0,
    startTime: '',
    endTime: '',
    isAutoExtension: false,
    lastBidExtension: 0,
    overallExtension: 0,
    scheduleBehaviour: '',

  });

  // Define types for API responses
  type ApiResponseItem = {
    id: string | number;
    name: string;
    [key: string]: any;
  };

  // Fetch data for dropdowns with proper typing
  const { data: eventCategoriesData = { data: [] } } = useGetActiveAuctionCategories();
  const { data: plantsData = { data: [] } } = useGetAllActivePlants();
  const { data: buyersData = { data: [] } } = useGetActiveBuyers();
  const businessDepartmentlist = [
    { id: "REPAIR_AND_MAINTENANCE", name: "Repair & Maintenance" },
    { id: "PROJECT", name: "PROJECT" }
  ];
  
  // Extract data arrays from API responses
  const eventCategories = eventCategoriesData.data || [];
  const plants = plantsData.data || [];
  const buyers = buyersData.data || [];
  
  // Convert businessDepartmentlist to match ApiResponseItem type
  const businessDepartments = businessDepartmentlist.map(dept => ({
    id: dept.id,
    name: dept.name
  }));

  // Format dropdown options with type safety
  const formatOptions = <T extends ApiResponseItem>(
    data: T[] = [], 
    valueKey: keyof T = 'id', 
    labelKey: keyof T = 'name' as keyof T,
    includeTerms: boolean = false
  ): (OptionType & { termsAndConditions?: string })[] => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      value: String(item?.[valueKey] ?? ''),
      label: String(item?.[labelKey] ?? ''),
      ...(includeTerms && { termsAndConditions: item.termsAndConditions || '' })
    }));
  };

  // Format options for MultiSelect with type safety
  const formatMultiSelectOptions = (options: OptionType[], selectedValues: string[] = []): MultiSelectOption[] => {
    return options.map(option => ({
      value: option.value,
      text: option.label,
      selected: selectedValues.includes(option.value)
    }));
  };

  const eventCategoryOptions = useMemo(
    () => formatOptions(eventCategories), 
    [eventCategories]
  );
  
  const businessDepartmentOptions = useMemo(
    () => formatOptions(businessDepartments), 
    [businessDepartments]
  );
  
  const plantOptions = useMemo(
    () => formatOptions(plants), 
    [plants]
  );
  
  const userOptions = useMemo(
    () => formatOptions(buyers, 'id', 'name'), 
    [buyers]
  );
  

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form submission
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigating to previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };
  const handleCategoryChange = (value: string) => {
    const selectedCategory = eventCategories.find((cat: any) => cat.id === value);
    console.log('Selected Category:', selectedCategory);
    
    // Get terms from either termsAndConditions or conditions property
    const terms = selectedCategory?.termsAndConditions || selectedCategory?.conditions || '';
    
    // Force a state update by creating a new object reference
    setFormData(prev => ({
      ...prev,
      eventCategory: value,
      termsAndConditions: terms
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileList = Array.from(files);
        setFormData(prev => ({
          ...prev,
          [name]: fileList
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (
    files: FileList | null, 
  ) => {
    if (!files) return;

    const validFileTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // PDF
      'application/pdf',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    // Check each file's type
    Array.from(files).forEach(file => {
      if (validFileTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      alert(`The following files have an unsupported format and were not added:\n${invalidFiles.join('\n')}\n\nPlease upload only images (JPEG, PNG, GIF), PDF, Word, or Excel files.`);
    }

    
  };

  const handleRemoveFile = (
    index: number, 
    field: 'eventDocuments' | 'vendorDocuments' | 'images'
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as File[]).filter((_, i) => i !== index)
    }));
  };



  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      'name',
      'eventCategory',
      'businessDepartment',
      'termsAndConditions'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // In a real app, you would upload files first and get their URLs
      const uploadFiles = async (files: File[]) => {
        // TODO: Implement file upload logic
        return await Promise.all(files.map(async (file) => {
          // Simulate file upload
          await new Promise(resolve => setTimeout(resolve, 500));
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // In real app, this would be the uploaded file URL
          };
        }));
      };

      const [eventDocs, vendorDocs] = await Promise.all([
        uploadFiles(formData.eventDocuments),
        uploadFiles(formData.vendorDocuments)
      ]);

      const submissionData = {
        ...formData,
        eventDocuments: eventDocs,
        vendorDocuments: vendorDocs,
      };

      console.log('Form submitted:', submissionData);
      
      // TODO: Uncomment and implement actual form submission
      // await api.createAuction(submissionData);
      // navigate('/auctions');
      
      alert('Auction created successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Auction Info
        return (
          <div className="space-y-6">
            {/* Auction Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auction Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter auction name"
                required
              />
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Category <span className="text-red-500">*</span>
              </label>
              <div className="select-wrapper">
                <Select
                  options={[
                    { value: '', label: 'Select an option' },
                    ...eventCategoryOptions
                  ]}
                  defaultValue={formData.eventCategory}
                  onChange={handleCategoryChange}
                  placeholder="Select event category"
                />
              </div>
            </div>

            {/* Business Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Department <span className="text-red-500">*</span>
              </label>
              <div className="select-wrapper">
                <Select
                  options={[
                    { value: '', label: 'Select an option' },
                    ...businessDepartmentOptions
                  ]}
                  defaultValue={formData.businessDepartment}
                  onChange={(value: string) => 
                    setFormData(prev => ({ ...prev, businessDepartment: value }))
                  }
                  placeholder="Select business department"
                />
              </div>
            </div>

            {/* Co-Creator Name (Optional) */}
            <div>
              <MultiSelect
                label="Co-Creator Name (Optional)"
                options={formatMultiSelectOptions(userOptions, formData.coCreators)}
                defaultSelected={formData.coCreators}
                onChange={(selected: string[]) => {
                  setFormData(prev => ({ ...prev, coCreators: selected }));
                }}
              />
            </div>

            {/* Plant Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant Name (Optional)
              </label>
              <Select
                options={[
                  { value: '', label: 'Select an option' },
                  ...plantOptions
                ]}
                defaultValue={formData.plantId}
                onChange={(value: string) => 
                  setFormData(prev => ({ ...prev, plantId: value }))
                }
                placeholder="Select plant"
              />
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions <span className="text-red-500">*</span>
              </label>
              <div key={`editor-${formData.eventCategory}`} className="border rounded-md overflow-hidden">
                <Editor
                  value={formData.termsAndConditions || ''}
                  onChange={(content) => {
                    setFormData(prev => ({
                      ...prev,
                      termsAndConditions: content
                    }));
                  }}
                  placeholder="Terms and conditions will be auto-filled based on category"
                />
              </div>
            </div>

            {/* Event Documents (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Documents (Optional)
              </label>
              <div className="file-input-wrapper">
                <FileInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFileUpload(e.target.files)
                  }
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                />
              </div>
              {formData.eventDocuments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.eventDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index, 'eventDocuments')}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Documents (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Documents (Optional)
              </label>
              <div className="file-input-wrapper">
                <FileInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFileUpload(e.target.files)
                  }
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                />
              </div>
              {formData.vendorDocuments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.vendorDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index, 'vendorDocuments')}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observers (Optional) */}
            <div>
              <MultiSelect
                label="Observers (Optional)"
                options={formatMultiSelectOptions(userOptions, formData.observers)}
                defaultSelected={formData.observers}
                onChange={(selected: string[]) => {
                  setFormData(prev => ({ ...prev, observers: selected }));
                }}
              />
            </div>
          </div>
        );
      
      case 1: // Auction Behavior
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Auction Type */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">Auction Type</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Use Predefined Template
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.predefinedTemplate}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            predefinedTemplate: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.predefinedTemplate && (
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Template
                        </label>
                        <select
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.templateId}
                          onChange={(e) => {
                            const selectedTemplate = e.target.value;
                            // Here you would typically fetch the template data and update the form
                            // For now, we'll just update the templateId
                            setFormData(prev => ({
                              ...prev,
                              templateId: selectedTemplate,
                              // Add more fields here to be populated from the template
                              // For example: auctionBehavior: templateData.auctionBehavior
                            }));
                          }}
                        >
                          <option value="">Select Template</option>
                          <option value="template1">Template 1 - Standard Auction</option>
                          <option value="template2">Template 2 - Quick Bidding</option>
                          <option value="template3">Template 3 - Sealed Bid</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auction Behavior <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3 pl-1">
                        {[
                          { value: 'PROJECT_AUCTION', label: 'Project Auction' },
                          { value: 'ENGLISH_AUCTION', label: 'English Auction' },
                          { value: 'DUTCH_AUCTION', label: 'Dutch Auction' },
                          { value: 'BIDDING', label: 'Bidding' },
                          { value: 'INDICATIVE_AUCTION', label: 'Indicative Auction' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <input
                              type="radio"
                              name="auctionBehavior"
                              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                              checked={formData.auctionBehavior === option.value}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                auctionBehavior: option.value
                              }))}
                            />
                            <span className="ml-3 text-base text-gray-700 dark:text-gray-300">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {!formData.auctionBehavior && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Please select an auction behavior
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Use Predefined Template
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.predefinedTemplate}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            predefinedTemplate: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.predefinedTemplate && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Template
                        </label>
                        <select
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.templateId}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            templateId: e.target.value
                          }))}
                        >
                          <option value="">Select Template</option>
                          {/* Template options would be populated from an API */}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bidding Settings */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">Bidding Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Display Leading Price
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.displayleadingprice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            displayleadingprice: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Has First Quote
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.HasFirstQuote}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            HasFirstQuote: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.HasFirstQuote && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Leading Price
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.leadingPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            leadingPrice: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Can Bid Against
                      </label>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.canBidAgainst === 'LEADING_PRICE'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              canBidAgainst: 'LEADING_PRICE'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Leading Price</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.canBidAgainst === 'VENDOR_SELF_PRICE'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              canBidAgainst: 'VENDOR_SELF_PRICE'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Vendor Self Price</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          MCD Price
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.mcdPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            mcdPrice: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Min BD Price
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.minimumBDPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            minimumBDPrice: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Bid Difference */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">Bid Difference</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Has Max Bid Difference
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.hasMaxBidDiff}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            hasMaxBidDiff: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.hasMaxBidDiff && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Bid Diff Price
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.maxBidDiffPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            maxBidDiffPrice: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Min Diff (Contractors)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.minBidDifferenceContractors}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            minBidDifferenceContractors: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Min Diff (Self)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.minBidDifferenceSelf}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            minBidDifferenceSelf: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Can Match Leading Vendor's Price
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.canMatchLeadingVendorsPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            canMatchLeadingVendorsPrice: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reserved Buying/Selling */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">Reserved Buying/Selling</h3>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Has Reserved Buying/Selling
                      </label>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.hasReservedBuyingOrSelling === 'INDICATIVE'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              hasReservedBuyingOrSelling: 'INDICATIVE'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Indicative</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.hasReservedBuyingOrSelling === 'STOP_FURTHER_BIDDING'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              hasReservedBuyingOrSelling: 'STOP_FURTHER_BIDDING'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Stop Further Bidding</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.hasReservedBuyingOrSelling === 'NOT_APPLICABLE'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              hasReservedBuyingOrSelling: 'NOT_APPLICABLE'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Not Applicable</span>
                        </label>
                      </div>
                    </div>

                    {(formData.hasReservedBuyingOrSelling === 'INDICATIVE' || 
                      formData.hasReservedBuyingOrSelling === 'STOP_FURTHER_BIDDING') && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reserve Buying/Selling Price
                        </label>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-md text-base"
                          value={formData.reserveBuyingSellingPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            reserveBuyingSellingPrice: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Settings */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">Display Settings</h3>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Display Participation Rank
                      </label>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.canDisplayParticipationRank === 'SHOW_TO_ALL'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              canDisplayParticipationRank: 'SHOW_TO_ALL'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Show to All</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.canDisplayParticipationRank === 'SHOW_ONLY_TO_LEADING_VENDORS'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              canDisplayParticipationRank: 'SHOW_ONLY_TO_LEADING_VENDORS'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Show Only to Leading Vendors</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.canDisplayParticipationRank === 'NOT_REQUIRED'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              canDisplayParticipationRank: 'NOT_REQUIRED'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Not Required</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Single Bid Only
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.isSingleBid}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            isSingleBid: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Mask Vendor Company Name
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.isVendorCompanyNameMasked}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            isVendorCompanyNameMasked: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Mask Vendor Bid Price
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.isVendorBidPriceMasked}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            isVendorBidPriceMasked: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Winner Announced
                      </label>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.winnerAnnounced === 'MANUAL'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              winnerAnnounced: 'MANUAL'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Manual</span>
                        </label>
                        <label className="flex items-center py-1.5">
                          <input
                            type="radio"
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-400"
                            checked={formData.winnerAnnounced === 'AUTOMATIC'}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              winnerAnnounced: 'AUTOMATIC'
                            }))}
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Automatic</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2: // Pricing
        return (
          <div className="space-y-4">
           
          </div>
        );
      
      case 3: // Images
        return (
          <div className="space-y-4">
            
          </div>
        );
      
      case 4: // Review
        return (
          <div className="space-y-6">
            
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-5">
      <PageHeader
        title="Create New Auction"
        subtitle="Fill in the details below to create a new auction"
        breadcrumbs={breadcrumbs}
        showBackButton={true}
        backButtonText="Back to Auctions"
        backButtonUrl="/auctions"
        className="mb-8"
        rightContent={
          <div className="flex items-center h-full">
            <div className="border-l border-gray-200 dark:border-gray-700 pl-4 ml-4 h-12 flex flex-col justify-center space-y-1">
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20">Auction:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-3">
                  {formData.name || ''}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20">Event Code:</span>
                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded ml-3">
                    {formData.eventCode}
                  </span>
              </div>
            </div>
          </div>
        }
      />
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Stepper */}
          <Stepper 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
            className="mb-8"
          />
          
          {/* Form Content */}
          <div className="bg-white p-6 rounded-lg border">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <div>
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="mr-2"
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Save as draft logic
                    console.log('Saving as draft:', formData);
                    // TODO: Implement save as draft functionality
                  }}
                >
                  Save as Draft
                </Button>
              </div>
              
              <Button
                type="button"
                onClick={handleNext}
                className={cn(
                  currentStep === steps.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''
                )}
              >
                {currentStep === steps.length - 1 ? 'Submit Auction' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAuction;