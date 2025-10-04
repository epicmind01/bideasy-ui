import React, { useState, useEffect } from 'react';
import { useCreateFromWithdrawnPOApi } from '../../hooks/API/PurchaseOrderApi';
// import { useGetVendorListQuery } from '../../hooks/API/useCommonApis';
import { toast } from 'react-hot-toast';

interface CreateFromWithdrawnPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawnPoId: string;
  originalItems: any[];
  onSuccess?: () => void;
}

const CreateFromWithdrawnPOModal: React.FC<CreateFromWithdrawnPOModalProps> = ({ 
  isOpen,
  onClose,
  withdrawnPoId, 
  originalItems, 
  onSuccess 
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createFromWithdrawnPO = useCreateFromWithdrawnPOApi();
  const vendors = { vendors: [] }; // Placeholder for now

  // Initialize selected items with original items
  useEffect(() => {
    if (originalItems && originalItems.length > 0) {
      setSelectedItems(originalItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price || 0,
        item: item.item
      })));
    }
  }, [originalItems]);

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedVendorId) {
      toast.error('Please select a vendor.');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item.');
      return;
    }

    if (selectedItems.some(item => item.quantity <= 0)) {
      toast.error('All items must have a quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createFromWithdrawnPO.mutateAsync({
        withdrawnPoId,
        newVendorId: selectedVendorId,
        items: selectedItems.filter(item => item.quantity > 0),
      });

      if (response.status === 200) {
        toast.success('New Purchase Order created successfully from withdrawn PO.');
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating new PO from withdrawn PO:', error);
      toast.error('Failed to create new Purchase Order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVendorId('');
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New PO from Withdrawn PO</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vendor *
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a vendor</option>
              {vendors?.vendors?.map((vendor: any) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name || vendor.email} - {vendor.email}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3">Select Items and Quantities</h3>
            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div key={item.itemId} className="flex items-center space-x-4 p-3 border rounded-md">
                  <div className="flex-1">
                    <p className="font-medium">{item.item?.itemCode || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{item.item?.MasterGeneric?.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Quantity:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={item.quantity}
                      onChange={(e) => handleItemQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">/ {item.quantity}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Price: ₹{item.price || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedVendorId || selectedItems.every(item => item.quantity <= 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create New PO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFromWithdrawnPOModal;
