import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface ProductItem {
  itemCode: string;
  itemName: string;
  annualVolumeQuantity: number;
  brandName?: string;
  MasterBrand?: { name: string };
  MasterGeneric?: { name: string };
  MasterCategory?: { name: string };
  itemTag?: string;
}

export interface RFQFormData {
  // Step 1: RFQ Details & Items
  title: string;
  department: string;
  buyerName: string;
  itemType: string;
  items: ProductItem[];
  itemCodes: string[];
  
  // Step 2: Vendor Selection
  selectedVendors: string[];
  
  // Step 3: Technical Specifications
  startDate: string;
  endDate: string;
  paymentTerms: string;
  attachments: File[];
  preferredVendors: Array<{
    plantCode: string;
    distributorName: string;
  }>;
  
  // Step 4: Collaboration
  collaborators: string[];
  collaboratorsWithRoles?: Array<{
    collaboratorId: string;
    role: string;
    name: string;
    email: string;
  }>;
  
  // Step 5: Review (no additional fields)
}

interface RFQContextType {
  // Form data
  formData: RFQFormData;
  setFormData: React.Dispatch<React.SetStateAction<RFQFormData>>;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  
  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Product selection
  selectedRowData: ProductItem[];
  setSelectedRowData: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  selectedItems: Set<string>;
  rowSelection: Record<string, boolean>;
  setRowSelection: (selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  
  // Vendor selection
  selectedVendorItems: Set<string>;
  setSelectedVendorItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedVendorRowData: any[];
  setSelectedVendorRowData: React.Dispatch<React.SetStateAction<any[]>>;
  vendorRowSelection: Record<string, boolean>;
  setVendorRowSelection: (selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  
  // Pagination and search
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  search: string;
  setSearch: (search: string) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectItem: string;
  setSelectItem: (type: string) => void;
  
  // Handlers
  handleQuantityChange: (row: ProductItem, value: string) => void;
  handleRowSelectionChange: (selection: Record<string, boolean>, productsData?: any[]) => void;
  handleVendorRowSelectionChange: (selection: Record<string, boolean>, vendorsData?: any[]) => void;
  handleClearAll: () => void;
  handleRemoveItem: (itemCode: string) => void;
  handlePerRowsChange: (newPerPage: number) => void;
  handlePageChange: (newPage: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  populateFormData: (rfqData: any) => void;
  handleRemoveFile: (index: number) => void;
  validateCurrentStep: () => boolean;
  
  // Context state
  isContextReady: boolean;
}

const RFQContext = createContext<RFQContextType | undefined>(undefined);

export const useRFQContext = () => {
  const context = useContext(RFQContext);
  if (!context) {
    console.error('RFQContext is undefined. Make sure the component is wrapped with RFQProvider.');
    throw new Error('useRFQContext must be used within an RFQProvider');
  }
  return context;
};

interface RFQProviderProps {
  children: React.ReactNode;
}

export const RFQProvider: React.FC<RFQProviderProps> = ({ children }) => {
  
  // Form data state
  const [formData, setFormData] = useState<RFQFormData>({
    title: '',
    department: '',
    buyerName: 'Current User',
    itemType: '',
    items: [],
    itemCodes: [],
    selectedVendors: [],
    startDate: '',
    endDate: '',
    paymentTerms: '',
    attachments: [],
    preferredVendors: [],
    collaborators: [],
    collaboratorsWithRoles: [],
  });


  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  
  // Product selection state
  const [selectedRowData, setSelectedRowData] = useState<ProductItem[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  
  // Memoized setters to prevent infinite loops
  const memoizedSetRowSelection = useCallback((selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    setRowSelection(selection);
  }, []);
  
  // Vendor selection state
  const [selectedVendorItems, setSelectedVendorItems] = useState<Set<string>>(new Set());
  const [selectedVendorRowData, setSelectedVendorRowData] = useState<any[]>([]);
  const [vendorRowSelection, setVendorRowSelection] = useState<Record<string, boolean>>({});
  
  // Memoized vendor setter
  const memoizedSetVendorRowSelection = useCallback((selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    setVendorRowSelection(selection);
  }, []);
  
  // Pagination and search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [selectItem, setSelectItem] = useState('MANUAL');
  
  // Context ready state
  const [isContextReady] = useState(true);

  // Computed values
  const selectedItems = new Set(selectedRowData.map((item: ProductItem) => item.itemCode));

  // Update form data helper
  const updateFormData = useCallback((updates: Partial<RFQFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Step navigation
  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  // Quantity change handler
  const handleQuantityChange = useCallback((row: ProductItem, value: string) => {
    const quantity = parseInt(value) || 0;
    
    setSelectedRowData(prev => {
      const existingProductIndex = prev.findIndex(p => p.itemCode === row.itemCode);
      if (existingProductIndex >= 0) {
        const updatedProducts = [...prev];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          annualVolumeQuantity: quantity
        };
        
        // Update form data immediately when quantity changes
        setFormData(prevFormData => ({
          ...prevFormData,
          itemCodes: updatedProducts.map(item => item.itemCode),
          items: updatedProducts.map(product => ({
            ...product,
            annualVolumeQuantity: product.annualVolumeQuantity ?? 0
          }))
        }));
        
        return updatedProducts;
      }
      return prev;
    });
  }, []);

  // Handle row selection from DataTable
  const handleRowSelectionChange = useCallback((selection: Record<string, boolean>, productsData?: any[]) => {
    setRowSelection(selection);
    
    if (!productsData) return; // Early return if no products data
    
    const selectedIndices = Object.keys(selection).filter(key => selection[key]);
    const selectedProducts = selectedIndices.map(index => productsData[parseInt(index)]);
    
    // Update selectedRowData with new selections
    setSelectedRowData(prev => {
      const existingItemsMap = new Map(
        prev.map((item) => [item.itemCode, item])
      );

      // Create new selection map
      const newSelection = new Map();
      
      // Add newly selected items
      selectedProducts.forEach((product: any) => {
        if (product) {
          newSelection.set(product.itemCode, {
            ...product,
            annualVolumeQuantity: existingItemsMap.get(product.itemCode)?.annualVolumeQuantity ?? 0,
          });
        }
      });

      // Keep items that are still selected but not in current page
      prev.forEach((item) => {
        if (!newSelection.has(item.itemCode) && selectedIndices.includes(item.itemCode)) {
          newSelection.set(item.itemCode, item);
        }
      });

      const updatedRowDataArray = Array.from(newSelection.values());
      
      // Update form data
      setFormData(prevFormData => ({
        ...prevFormData,
        itemCodes: updatedRowDataArray.map(item => item.itemCode),
        items: updatedRowDataArray.map(product => ({
          ...product,
          annualVolumeQuantity: product.annualVolumeQuantity ?? 0
        }))
      }));

      return updatedRowDataArray;
    });
  }, []);

  // Handle vendor row selection
  const handleVendorRowSelectionChange = useCallback((selection: Record<string, boolean>, vendorsData?: any[]) => {
    setVendorRowSelection(selection);
    
    if (!vendorsData) return; // Early return if no vendors data
    
    const selectedIndices = Object.keys(selection).filter(key => selection[key]);
    const selectedVendors = selectedIndices.map(index => vendorsData[parseInt(index)]);
    
    // Update selectedVendorRowData with new selections
    setSelectedVendorRowData(prev => {
      // Create new selection map
      const newSelection = new Map();
      
      // Add newly selected vendors
      selectedVendors.forEach((vendor: any) => {
        if (vendor) {
          newSelection.set(vendor.id, vendor);
        }
      });

      // Keep items that are still selected but not in current page
      prev.forEach((item) => {
        if (!newSelection.has(item.id) && selectedIndices.includes(item.id)) {
          newSelection.set(item.id, item);
        }
      });

      const updatedRowDataArray = Array.from(newSelection.values());
      
      // Update form data
      setFormData(prevFormData => ({
        ...prevFormData,
        selectedVendors: updatedRowDataArray.map(vendor => vendor.id)
      }));

      return updatedRowDataArray;
    });
  }, []);

  // Clear all selected items
  const handleClearAll = useCallback(() => {
    setSelectedRowData([]);
    setRowSelection({});
    setFormData(prev => ({
      ...prev,
      itemCodes: [],
      items: []
    }));
  }, []);

  // Remove specific item
  const handleRemoveItem = useCallback((itemCode: string) => {
    setSelectedRowData(prev => {
      const updatedProducts = [...prev];
      const index = updatedProducts.findIndex(p => p.itemCode === itemCode);
      if (index >= 0) {
        updatedProducts.splice(index, 1);
        
        setFormData(prevFormData => ({
          ...prevFormData,
          itemCodes: updatedProducts.map(item => item.itemCode),
          items: updatedProducts.map(product => ({
            ...product,
            annualVolumeQuantity: product.annualVolumeQuantity ?? ''
          }))
        }));
        return updatedProducts;
      }
      return prev;
    });
  }, []);

  // Pagination handlers
  const handlePerRowsChange = useCallback((newPerPage: number) => {
    setLimit(newPerPage);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // File handlers
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  // Validation
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 0: // RFQ Details & Items
        if (!formData.title.trim()) {
          return false;
        }
        if (!formData.department) {
          return false;
        }
        if (!formData.buyerName.trim()) {
          return false;
        }
        if (!formData.itemType) {
          return false;
        }
        if (!formData.itemCodes || formData.itemCodes.length === 0) {
          return false;
        }
        if (!formData.items || formData.items.length === 0) {
          return false;
        }
        if (!formData.items || formData.items.length === 0 || formData.items.some(el => (!el.annualVolumeQuantity || el.annualVolumeQuantity === 0))) {
          return false;
        }
        return true;
      case 1: // Vendor Selection
        if (formData.selectedVendors.length === 0) {
          return false;
        }
        return true;
      case 2: // Technical Specifications
        if (!formData.startDate) {
          return false;
        }
        if (!formData.endDate) {
          return false;
        }
        if (!formData.paymentTerms) {
          return false;
        }
        return true;
      case 3: // Collaboration
        return true; // Optional step
      case 4: // Review
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Function to populate form data when editing
  const populateFormData = useCallback((rfqData: any) => {
    if (!rfqData) return;
    
    setFormData({
      title: rfqData.title || '',
      department: rfqData.department?.id || '',
      buyerName: rfqData.buyer?.name || 'Current User',
      itemType: rfqData.itemType || '',
      items: rfqData.items?.map((item: any) => ({
        itemCode: item.item?.itemCode || item.itemCode,
        itemName: item.item?.itemName || item.itemName,
        annualVolumeQuantity: item.annualVolumeQuantity || 0,
        brandName: item.item?.brandName || item.brandName,
        MasterBrand: item.item?.MasterBrand || item.MasterBrand,
        MasterGeneric: item.item?.MasterGeneric || item.MasterGeneric,
        MasterCategory: item.item?.MasterCategory || item.MasterCategory,
        itemTag: item.item?.itemTag || item.itemTag,
      })) || [],
      itemCodes: rfqData.items?.map((item: any) => item.item?.itemCode || item.itemCode) || [],
      selectedVendors: rfqData.vendors?.map((vendor: any) => vendor.id || vendor.vendorId) || [],
      startDate: rfqData.technicalSpec?.startDate || '',
      endDate: rfqData.technicalSpec?.endDate || '',
      paymentTerms: rfqData.technicalSpec?.paymentTerms || '',
      attachments: [], // Files can't be restored from API
      preferredVendors: rfqData.preferredVendors || [],
      collaborators: rfqData.collaborators?.map((collab: any) => collab.id || collab.collaboratorId) || [],
      collaboratorsWithRoles: rfqData.collaborators?.map((collab: any) => ({
        collaboratorId: collab.id || collab.collaboratorId,
        role: collab.role || 'Viewer',
        name: collab.name || collab.user?.name,
        email: collab.email || collab.user?.email,
      })) || [],
    });

    // Update selected row data for products
    if (rfqData.items && rfqData.items.length > 0) {
      const mappedItems = rfqData.items.map((item: any) => ({
        itemCode: item.item?.itemCode || item.itemCode,
        itemName: item.item?.itemName || item.itemName,
        annualVolumeQuantity: item.annualVolumeQuantity || 0,
        brandName: item.item?.brandName || item.brandName,
        MasterBrand: item.item?.MasterBrand || item.MasterBrand,
        MasterGeneric: item.item?.MasterGeneric || item.MasterGeneric,
        MasterCategory: item.item?.MasterCategory || item.MasterCategory,
        itemTag: item.item?.itemTag || item.itemTag,
      }));
      setSelectedRowData(mappedItems);
    }

    // Update selected vendor data
    if (rfqData.vendors && rfqData.vendors.length > 0) {
      setSelectedVendorRowData(rfqData.vendors);
    }
  }, []);

  const contextValue: RFQContextType = useMemo(() => ({
    // Form data
    formData,
    setFormData,
    updateFormData,
    
    // Step management
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    
    // Product selection
    selectedRowData,
    setSelectedRowData,
    selectedItems,
    rowSelection,
    setRowSelection: memoizedSetRowSelection,
    
    // Vendor selection
    selectedVendorItems,
    setSelectedVendorItems,
    selectedVendorRowData,
    setSelectedVendorRowData,
    vendorRowSelection,
    setVendorRowSelection: memoizedSetVendorRowSelection,
    
    // Pagination and search
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    
    // UI state
    isLoading,
    setIsLoading,
    selectItem,
    setSelectItem,
    
    // Handlers
    handleQuantityChange,
    handleRowSelectionChange,
    handleVendorRowSelectionChange,
    handleClearAll,
    handleRemoveItem,
    handlePerRowsChange,
    handlePageChange,
    handleFileUpload,
    handleRemoveFile,
    validateCurrentStep,
    populateFormData,
    isContextReady,
  }), [
    formData,
    currentStep,
    selectedRowData,
    selectedItems,
    rowSelection,
    nextStep,
    previousStep,
    updateFormData,
    selectedVendorItems,
    selectedVendorRowData,
    vendorRowSelection,
    page,
    limit,
    search,
    isLoading,
    selectItem,
    memoizedSetRowSelection,
    memoizedSetVendorRowSelection,
    handleQuantityChange,
    handleRowSelectionChange,
    handleVendorRowSelectionChange,
    handleClearAll,
    handleRemoveItem,
    handlePerRowsChange,
    handlePageChange,
    handleFileUpload,
    handleRemoveFile,
    validateCurrentStep,
    populateFormData,
    isContextReady,
  ]);

  return (
    <RFQContext.Provider value={contextValue}>
      {isContextReady ? children : <div>Loading...</div>}
    </RFQContext.Provider>
  );
};
