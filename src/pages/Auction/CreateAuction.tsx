import React, { useState, useMemo } from 'react';
// Removed unused import
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import { Input } from '../../components/ui/input';
import { Stepper } from '../../components/ui/stepper/Stepper';
import { cn } from '../../lib/utils';
import Select from '../../components/form/Select';
import MultiSelect from '../../components/form/MultiSelect';
import FileInput from '../../components/form/input/FileInput';
import { Editor } from '../../components/editor/Editor';
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
  auctionName: string;
  eventCategory: string;
  businessDepartment: string;
  coCreators: string[];
  plantName: string;
  termsAndConditions: string;
  eventDocuments: File[];
  vendorDocuments: File[];
  observers: string[];
  
  // Step 2: Auction Behavior
  startDate: string;
  endDate: string;
  
  // Step 3: Item Info
  productName: string;
  category: string;
  condition: string;
  specifications: string;
  
  // Step 4: Pricing
  startPrice: string;
  reservePrice: string;
  buyNowPrice: string;
  
  // Step 5: Images
  images: File[];
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
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    auctionName: '',
    eventCategory: '',
    businessDepartment: '',
    coCreators: [],
    plantName: '',
    termsAndConditions: '',
    eventDocuments: [],
    vendorDocuments: [],
    observers: [],
    // Step 2
    startDate: '',
    endDate: '',
    // Step 3
    productName: '',
    category: '',
    condition: '',
    specifications: '',
    // Step 4
    startPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    // Step 5
    images: []
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
    field: 'eventDocuments' | 'vendorDocuments' | 'images'
  ) => {
    if (files) {
      const fileList = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), ...fileList]
      }));
    }
  };

  const handleRemoveFile = (
    index: number, 
    field: 'eventDocuments' | 'vendorDocuments' | 'images'
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };


  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      'auctionName',
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
                name="auctionName"
                value={formData.auctionName}
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
                defaultValue={formData.plantName}
                onChange={(value: string) => 
                  setFormData(prev => ({ ...prev, plantName: value }))
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
                    handleFileUpload(e.target.files, 'eventDocuments')
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
                    handleFileUpload(e.target.files, 'vendorDocuments')
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <Input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="collectibles">Collectibles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="new">New</option>
                  <option value="used">Used - Like New</option>
                  <option value="good">Used - Good</option>
                  <option value="fair">Used - Fair</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Enter product specifications (e.g., size, color, model, etc.)"
              />
            </div>
          </div>
        );
      
      case 2: // Pricing
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  name="startPrice"
                  value={formData.startPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-7"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum price you're willing to accept (optional)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buy Now Price ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-7"
                />
                <p className="mt-1 text-xs text-gray-500">Allow buyers to purchase immediately at this price (optional)</p>
              </div>
            </div>
          </div>
        );
      
      case 3: // Images
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, or GIF (MAX. 10MB each)</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'images')}
                />
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images ({formData.images.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.splice(index, 1);
                          setFormData(prev => ({
                            ...prev,
                            images: newImages
                          }));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Auction Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{formData.auctionName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">
                    {formData.termsAndConditions ? 
                      (formData.termsAndConditions.length > 50 ? `${formData.termsAndConditions.substring(0, 50)}...` : formData.termsAndConditions) : 
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{formData.productName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{formData.category || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium capitalize">{formData.condition || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="font-medium">
                    {formData.startPrice ? `$${parseFloat(formData.startPrice).toFixed(2)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reserve Price</p>
                  <p className="font-medium">
                    {formData.reservePrice ? `$${parseFloat(formData.reservePrice).toFixed(2)}` : 'No reserve price'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buy Now Price</p>
                  <p className="font-medium">
                    {formData.buyNowPrice ? `$${parseFloat(formData.buyNowPrice).toFixed(2)}` : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Images</h3>
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {formData.images.map((file, index) => (
                    <img 
                      key={index} 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images uploaded</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Auction</CardTitle>
          <p className="text-sm text-gray-500">
            Complete all the steps to create your auction listing
          </p>
        </CardHeader>
        <CardContent>
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