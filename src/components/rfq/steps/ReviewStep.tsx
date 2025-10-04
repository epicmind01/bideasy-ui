import React from 'react';
import { useRFQContext } from '../../../context/RFQContext';

const ReviewStep: React.FC = () => {
  const { formData } = useRFQContext();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">RFQ Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-medium">{formData.title || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{formData.department || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Item Type</p>
            <p className="font-medium">{formData.itemType || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Buyer</p>
            <p className="font-medium">{formData.buyerName}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Items ({formData.items.length})</h3>
        {formData.items.length > 0 ? (
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                <div>
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
                </div>
                <p className="text-sm text-gray-600">Qty: {item.annualVolumeQuantity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No items added</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">
              {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">
              {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Terms</p>
            <p className="font-medium">{formData.paymentTerms || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attachments</p>
            <p className="font-medium">{formData.attachments.length} files</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Selected Vendors ({formData.selectedVendors.length})</h3>
        <p className="text-sm text-gray-600">
          {formData.selectedVendors.length} vendors will be invited to participate in this RFQ.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Collaborators ({formData.collaborators.length})</h3>
        <p className="text-sm text-gray-600">
          {formData.collaborators.length} team members will have access to this RFQ.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
