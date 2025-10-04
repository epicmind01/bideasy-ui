import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, AlertCircle } from 'lucide-react';

// Components
import ExcelUploadModal from './ExcelUploadModal';
import { Input } from '../../components/ui/input';
import Button from '../../components/ui/button/Button';
import { Card } from '../../components/ui/card';
import StatCard from '../../components/ui/stat-card/StatCard';

// Hooks
import { useGetMasterCountApi } from '../../hooks/API/useCommonApis';

// Types
interface MasterDataItem {
  title: string;
  count: number;
  path: string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  iconColor?: string;
  accentColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  allowPermission?: string[];
}

interface GroupItem {
  title?: string;
  groupTitle?: string;
  items: MasterDataItem[];
};

type _ApiResponse<T = any> = {
  data: T;
  message?: string;
  success?: boolean;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    data: getCardsRecords, 
    refetch, 
    isLoading,
    isError, 
    error 
  } = useGetMasterCountApi();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const fetchData = async (): Promise<void> => {
    try {
      setIsRefreshing(true);
      await refetch();
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredGroups = useMemo<GroupItem[]>(() => {
    // Handle initial state and missing data
    if (!getCardsRecords?.data) return [];
    
    const data = Array.isArray(getCardsRecords.data) ? getCardsRecords.data : [];
    const searchLower = searchTerm.toLowerCase();
    
    return data
      .filter((group) => {
        if (!group) return false;
        const hasTitle = typeof group.title === 'string' || typeof group.groupTitle === 'string';
        return hasTitle && Array.isArray(group.items);
      })
      .map(group => ({
        title: group.title,
        groupTitle: group.groupTitle,
        items: group.items.filter(item => {
          if (!item || typeof item.title !== 'string') return false;
          const titleMatch = item.title.toLowerCase().includes(searchLower);
          const description = item.description ?? item.subtitle ?? '';
          const descMatch = description.toLowerCase().includes(searchLower);
          return titleMatch || descMatch;
        })
      }))
      .filter(group => group.items.length > 0);
  }, [getCardsRecords, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleOpenExcelModal = (): void => {
    setIsExcelModalOpen(true);
  };

  const handleCloseExcelModal = (): void => {
    setIsExcelModalOpen(false);
  };

  const handleRefresh = (): void => {
    void fetchData();
  };

  // Loading skeleton
  const renderSkeletons = () => (
    <div className="space-y-8">
      {[1, 2].map(group => (
        <div key={group} className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map(item => (
              <Card key={item} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading master data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'Failed to load master data. Please try again.'}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={fetchData}
                  disabled={isRefreshing}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isRefreshing ? 'Retrying...' : 'Retry'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  const hasNoResults = filteredGroups.length === 0;
  if (searchTerm && hasNoResults) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-gray-500 mb-4">
          <Search className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p className="text-lg">No results found for "{searchTerm}"</p>
          <p className="text-sm mt-2">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSearchTerm('')}
        >
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Master Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all master data records
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search master data..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full md:w-64"
              disabled={isLoading || isRefreshing}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="whitespace-nowrap"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleOpenExcelModal}
              className="whitespace-nowrap"
              disabled={isLoading || isRefreshing}
            >
              <Download className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading || isRefreshing ? (
        renderSkeletons()
      ) : (
        <>
          <div className="space-y-8">
            {filteredGroups.map((group, index) => {
              const groupTitle = group.title || group.groupTitle || 'Untitled Group';
              const groupItems = group.items || [];
              return (
                <section key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{groupTitle}</h2>
                    <span className="text-sm text-muted-foreground">
                      {groupItems.length} items
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupItems.map((item: MasterDataItem) => {
                      // Use the color from API response, fallback to accentColor or default blue
                      const bgColor = item.accentColor || item.color || '#3b82f6';
                      const description = item.subtitle || item.description || '';
                      
                      return (
                        <div 
                          key={item.path}
                          className="group"
                        >
                          <StatCard
                            title={item.title}
                            value={item.count}
                            description={description}
                            bgColor={bgColor}
                            showButton={true}
                            buttonIcon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            }
                            onButtonClick={() => navigate(item.path)}
                            className="h-full group-hover:shadow-lg transition-shadow duration-200"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <ExcelUploadModal
            isOpen={isExcelModalOpen}
            onClose={handleCloseExcelModal}
            onSuccess={() => {
              void fetchData();
              handleCloseExcelModal();
            }}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
