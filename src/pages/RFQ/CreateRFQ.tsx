import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import { Stepper } from '../../components/ui/stepper/Stepper';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { RFQProvider, useRFQContext } from '../../context/RFQContext';
import { useCreateRFQApi, useGetRFQByIdApi, useUpdateRFQApi } from '../../hooks/API/RFQApi';

// Import step components
import RFQDetailsStep from '../../components/rfq/steps/RFQDetailsStep';
import VendorSelectionStep from '../../components/rfq/steps/VendorSelectionStep';
import TechnicalSpecsStep from '../../components/rfq/steps/TechnicalSpecsStep';
import CollaborationStep from '../../components/rfq/steps/CollaborationStep';
import ReviewStep from '../../components/rfq/steps/ReviewStep';

// Define the steps for the RFQ creation stepper
const steps = [
  { id: 'rfq-details', name: 'RFQ Details & Items' },
  { id: 'vendor-selection', name: 'Vendor Selection' },
  { id: 'technical-specs', name: 'Technical Specifications' },
  { id: 'collaboration', name: 'Collaboration' },
  { id: 'review', name: 'Review & Publish' },
];

const CreateRFQContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqId = searchParams.get('id');
  const isEditMode = !!rfqId;
  
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    formData,
    isLoading,
    setIsLoading,
    setSearch,
    validateCurrentStep,
    populateFormData,
  } = useRFQContext();

  const { mutate: createRFQ } = useCreateRFQApi();
  const { mutate: updateRFQ } = useUpdateRFQApi();
  const { data: existingRFQ, isLoading: isLoadingRFQ } = useGetRFQByIdApi(rfqId || '');

  // Clear search when changing steps
  useEffect(() => {
    setSearch('');
  }, [currentStep, setSearch]);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && existingRFQ && populateFormData) {
      populateFormData(existingRFQ);
    }
  }, [isEditMode, existingRFQ, populateFormData]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        nextStep();
      } else {
        handleSubmit();
      }
    } else {
      // Show validation errors
      switch (currentStep) {
        case 0:
          if (!formData.title.trim()) {
            toast.error('Please enter event title');
          } else if (!formData.department) {
            toast.error('Please select a department');
          } else if (!formData.buyerName.trim()) {
            toast.error('Buyer Name is empty');
          } else if (!formData.itemType) {
            toast.error('Please select item types');
          } else if (!formData.itemCodes || formData.itemCodes.length === 0) {
            toast.error('Please select items');
          } else if (!formData.items || formData.items.length === 0) {
            toast.error('Please Select Products');
          } else if (!formData.items || formData.items.length === 0 || formData.items.some(el => (!el.annualVolumeQuantity || el.annualVolumeQuantity === 0))) {
            toast.error('Please Fill Volume');
          }
          break;
        case 1:
          if (formData.selectedVendors.length === 0) {
            toast.error('Please select at least one vendor');
          }
          break;
        case 2:
          if (!formData.startDate) {
            toast.error('Please select start date');
          } else if (!formData.endDate) {
            toast.error('Please select end date');
          } else if (!formData.paymentTerms) {
            toast.error('Please select payment terms');
          }
          break;
      }
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Create FormData for API submission
    const submitData = {
      title: formData.title,
      department: formData.department,
      itemType: formData.itemType,
      items: formData.items,
      startDate: formData.startDate,
      endDate: formData.endDate,
      paymentTerms: formData.paymentTerms,
      selectedVendors: formData.selectedVendors,
      preferredVendors: formData.preferredVendors,
      collaborators: formData.collaborators,
    };

    if (isEditMode) {
      // Update existing RFQ
      updateRFQ({ rfqEventId: rfqId!, data: submitData }, {
        onSuccess: () => {
          setIsLoading(false);
          toast.success('RFQ updated successfully');
          navigate('/rfq');
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error('Failed to update RFQ');
          console.error('Failed to update RFQ:', error);
        }
      });
    } else {
      // Create new RFQ
      createRFQ(submitData, {
        onSuccess: () => {
          setIsLoading(false);
          toast.success('RFQ created successfully');
          navigate('/rfq');
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error('Failed to create RFQ');
          console.error('Failed to create RFQ:', error);
        }
      });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigating to previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <RFQDetailsStep />;
      case 1:
        return <VendorSelectionStep />;
      case 2:
        return <TechnicalSpecsStep />;
      case 3:
        return <CollaborationStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit RFQ' : 'Create New RFQ'}
            {isEditMode && existingRFQ && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {existingRFQ.eventCode}
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {isEditMode 
              ? 'Update your RFQ details and settings'
              : 'Complete all the steps to create your RFQ'
            }
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
                    onClick={previousStep}
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
                disabled={isLoading || isLoadingRFQ}
                className={cn(
                  currentStep === steps.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''
                )}
              >
                {isLoading || isLoadingRFQ 
                  ? 'Processing...' 
                  : currentStep === steps.length - 1 
                    ? (isEditMode ? 'Update RFQ' : 'Create RFQ') 
                    : 'Next'
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CreateRFQ: React.FC = () => {
  return (
    <RFQProvider>
      <CreateRFQContent />
    </RFQProvider>
  );
};

export default CreateRFQ;
