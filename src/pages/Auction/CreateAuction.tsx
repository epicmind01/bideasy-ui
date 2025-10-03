import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import  Button  from '../../components/ui/button/Button';
import { Input } from '../../components/ui/input';
import { Stepper } from '../../components/ui/stepper/Stepper';
import { cn } from '../../lib/utils';

// Define the steps for the stepper
const steps = [
  { id: 'auction-info', name: 'Auction Info' },
  { id: 'auction-behavior', name: 'Auction Behavior' },
  { id: 'item-info', name: 'Item Info' },
  { id: 'participants', name: 'Participants' },
  { id: 'schedule', name: 'Schedule' },
];

const CreateAuction: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Auction Details
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    
    // Step 2: Auction Info
    productName: '',
    category: '',
    condition: 'new',
    specifications: '',
    
    // Step 3: Pricing
    startPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    
    // Step 4: Images
    images: [] as File[],
    
    // Step 5: Review (no additional fields, just for confirmation)
  });
  
  const navigate = useNavigate();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // TODO: Implement form submission logic
    // navigate('/auctions');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Auction Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter auction title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Enter detailed description"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <Input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                <Input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 1: // Product Info
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
                  onChange={handleImageUpload}
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
                  <p className="font-medium">{formData.title || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">
                    {formData.description ? 
                      (formData.description.length > 50 ? `${formData.description.substring(0, 50)}...` : formData.description) : 
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