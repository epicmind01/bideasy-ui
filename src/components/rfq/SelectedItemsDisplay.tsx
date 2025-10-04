import React from 'react';
import { useRFQContext } from '../../context/RFQContext';

interface BaseItem {
  id?: string;
  itemCode?: string;
  itemName?: string;
  name?: string;
  companyName?: string;
  vendorCode?: string;
  typeOfSupplier?: string;
  email?: string;
  annualVolumeQuantity?: number;
  MasterGeneric?: { name: string };
}

interface SelectedItemsDisplayProps {
  items: BaseItem[];
  onRemoveItem: (itemCode: string) => void;
  onClearAll: () => void;
  title: string;
  itemType: 'products' | 'vendors';
}

const SelectedItemsDisplay: React.FC<SelectedItemsDisplayProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  title,
  itemType
}) => {
  const { handleQuantityChange } = useRFQContext();
  
  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-lg font-semibold text-gray-800">{title}</h5>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <div
              key={itemType === 'products' ? item.itemCode || `product-${index}` : item.id || `vendor-${index}`}
              className="bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {itemType === 'products' ? item.itemName : (item.name || item.companyName)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {itemType === 'products' 
                        ? `Code: ${item.itemCode} - ${item?.MasterGeneric?.name}`
                        : `Code: ${item.vendorCode} | ${item.typeOfSupplier}`
                      }
                    </p>
                    {itemType === 'products' && (
                      <div className="flex items-center space-x-2 mt-1">
                        <label className="text-xs text-gray-600">Qty:</label>
                        <input
                          type="number"
                          min="0"
                          value={item.annualVolumeQuantity || 0}
                          onChange={(e) => {
                            if (itemType === 'products' && item.itemCode) {
                              handleQuantityChange(item as any, e.target.value);
                            }
                          }}
                          className="w-16 text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    {itemType === 'vendors' && item.email && (
                      <p className="text-xs text-gray-400 truncate">
                        {item.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const itemId = itemType === 'products' ? item.itemCode : item.id;
                  if (itemId) {
                    onRemoveItem(itemId);
                  }
                }}
                className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                title={`Remove ${itemType === 'products' ? 'item' : 'vendor'}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedItemsDisplay;
