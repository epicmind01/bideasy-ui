import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../hooks/API/useAuth';
import { LOCAL_STORAGE_KEYS } from '../Utils/Helpers';
import Button from '../components/ui/button/Button';
import PageHeader from '../components/ui/page-header/PageHeader';
import StatCard from '../components/ui/stat-card';
import type { User } from '../Typings/LoginApiTypes';

type UserProfile = Omit<User, 'password' | 'deletedAt' | 'BuyerRoleAssignment'> & {
  buyerRoleAssignment: Array<{
    id: string;
    buyerId: string;
    roleId: string;
    createdAt: string;
    role: Array<{
      id: string;
      title: string;
    }>;
  }>;
  lastLogin?: string;
  head?: {
    name: string;
  };
  _count: {
    // Existing counts
    ARCApproval: number;
    AuctionTemplate: number;
    Collaboration: number;
    MasterCategoryApproved: number;
    MasterCategoryCreated: number;
    MasterMaterialGroupApproved: number;
    MasterMaterialGroupCreated: number;
    MasterPaymentTermsAppvoed: number;
    MasterPaymentTermsCreated: number;
    RFQEvent: number;
    approvals: number;
    coCreatedAuctions: number;
    createdARCReports: number;
    createdBuyers: number;
    invitedVendors: number;
    subordinates: number;
    
    // Additional counts used in the UI
    AuctionCreated?: number;
    PurchaseRequestApproval?: number;
    InvoiceApproval?: number;
    PurchaseRequest?: number;
    PurchaseOrder?: number;
    sentNotifications?: number;
    receivedNotifications?: number;
    readNotifications?: number;
    Log?: number;
  };
};

export default function Profile() {
  const { data, isLoading, error, refetch } = getUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    employeeId: '',
    mobile: '',
    address: '',
    bio: '',
    avatar: null,
    headId: '',
    createdById: null,
    name: '',
    companyName: '',
    userType: '',
    prAutoStatus: false,
    createdAt: '',
    updatedAt: '',
    lastLogin: '',
    head: { id: '', name: '' },
    createdBy: null,
    buyerRoleAssignment: [],
    _count: {
      ARCApproval: 0,
      AuctionTemplate: 0,
      Collaboration: 0,
      MasterCategoryApproved: 0,
      MasterCategoryCreated: 0,
      MasterMaterialGroupApproved: 0,
      MasterMaterialGroupCreated: 0,
      MasterPaymentTermsAppvoed: 0,
      MasterPaymentTermsCreated: 0,
      RFQEvent: 0,
      approvals: 0,
      coCreatedAuctions: 0,
      createdARCReports: 0,
      createdBuyers: 0,
      invitedVendors: 0,
      subordinates: 0
    }
  });
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  useEffect(() => {
    if (data?.user) {
      const { password: _password, deletedAt: _deletedAt, ...userData } = data.user;
      const updatedProfile = {
        ...userData,
        lastLogin: new Date().toISOString(),
        buyerRoleAssignment: userData.BuyerRoleAssignment || []
      };
      
      setProfile(updatedProfile);
      setFormData(updatedProfile);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Error loading profile: {error instanceof Error ? error.message : 'Unknown error'}
        <Button
          key="retry"
          variant="primary"
          onClick={refetch}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you would update the profile via an API call here
      // await updateProfileAPI(formData);
      setProfile(formData);
      setIsEditing(false);
      // Update localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profile"
        subtitle="Manage your account settings and personal information"
        className="mb-6"
      >
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Button
              key="cancel"
              variant="outline"
              onClick={handleCancel}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              key="save"
              variant="primary"
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            key="edit"
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Form */}
        <div className="relative">
          {/* Avatar Section */}
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-gray-600 dark:text-gray-300">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">{profile.name || 'User'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {profile.userType?.toLowerCase() || 'User'}
                {profile.companyName && ` • ${profile.companyName}`}
              </p>
              {profile.head && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reports to: {profile.head.name}
                </p>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-6">
              <h3 className="mb-6 text-lg font-medium">Personal Information</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        {profile.name || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    ) : (
                      <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        {profile.mobile || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Employee ID
                    </label>
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.employeeId || 'Not assigned'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.bio || 'No bio provided'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </label>
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.companyName || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      User Type
                    </label>
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.userType || 'Not specified'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                      {profile.address || 'No address provided'}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Roles & Permissions
                  </h4>
                  <div className="space-y-2">
                    {profile.buyerRoleAssignment?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.buyerRoleAssignment?.map((assignment, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {assignment?.role?.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800">
                        No roles assigned
                      </div>
                    )}
                  </div>
                </div>


                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-medium">Activity Statistics</h3>
        
        {/* Auctions & RFQs */}
        {((profile._count?.RFQEvent || 0) > 0 || (profile._count?.AuctionCreated || 0) > 0 || (profile._count?.coCreatedAuctions || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Auctions & RFQs</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.RFQEvent || 0) > 0 && (
                <StatCard title="RFQ Events" value={profile._count.RFQEvent} bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
              )}
              {(profile._count?.AuctionCreated || 0) > 0 && (
                <StatCard title="Auctions Created" value={profile._count.AuctionCreated} bgColor="bg-green-50 dark:bg-green-900/20" />
              )}
              {(profile._count?.coCreatedAuctions || 0) > 0 && (
                <StatCard title="Co-Created Auctions" value={profile._count.coCreatedAuctions} bgColor="bg-teal-50 dark:bg-teal-900/20" />
              )}
            </div>
          </div>
        )}

        {/* Approvals */}
        {((profile._count?.approvals || 0) > 0 || (profile._count?.ARCApproval || 0) > 0 || (profile._count?.PurchaseRequestApproval || 0) > 0 || (profile._count?.InvoiceApproval || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Approvals & Reviews</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.approvals || 0) > 0 && (
                <StatCard title="Approvals" value={profile._count.approvals} bgColor="bg-amber-50 dark:bg-amber-900/20" />
              )}
              {(profile._count?.ARCApproval || 0) > 0 && (
                <StatCard title="ARC Approvals" value={profile._count.ARCApproval} bgColor="bg-blue-50 dark:bg-blue-900/20" />
              )}
              {(profile._count?.PurchaseRequestApproval || 0) > 0 && (
                <StatCard title="PR Approvals" value={profile._count.PurchaseRequestApproval} bgColor="bg-indigo-50 dark:bg-indigo-900/20" />
              )}
              {(profile._count?.InvoiceApproval || 0) > 0 && (
                <StatCard title="Invoice Approvals" value={profile._count.InvoiceApproval} bgColor="bg-purple-50 dark:bg-purple-900/20" />
              )}
            </div>
          </div>
        )}

        {/* Purchase & Orders */}
        {((profile._count?.PurchaseRequest || 0) > 0 || (profile._count?.PurchaseOrder || 0) > 0 || (profile._count?.AuctionTemplate || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Purchase & Orders</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.PurchaseRequest || 0) > 0 && (
                <StatCard title="Purchase Requests" value={profile._count.PurchaseRequest} bgColor="bg-rose-50 dark:bg-rose-900/20" />
              )}
              {(profile._count?.PurchaseOrder || 0) > 0 && (
                <StatCard title="Purchase Orders" value={profile._count.PurchaseOrder} bgColor="bg-pink-50 dark:bg-pink-900/20" />
              )}
              {(profile._count?.AuctionTemplate || 0) > 0 && (
                <StatCard title="Auction Templates" value={profile._count.AuctionTemplate} bgColor="bg-fuchsia-50 dark:bg-fuchsia-900/20" />
              )}
            </div>
          </div>
        )}

        {/* Notifications & Activity */}
        {((profile._count?.sentNotifications || 0) > 0 || (profile._count?.receivedNotifications || 0) > 0 || (profile._count?.readNotifications || 0) > 0 || (profile._count?.Log || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Activity</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.sentNotifications || 0) > 0 && (
                <StatCard title="Sent Notifications" value={profile._count.sentNotifications} bgColor="bg-violet-50 dark:bg-violet-900/20" />
              )}
              {(profile._count?.receivedNotifications || 0) > 0 && (
                <StatCard title="Received Notifications" value={profile._count.receivedNotifications} bgColor="bg-sky-50 dark:bg-sky-900/20" />
              )}
              {(profile._count?.readNotifications || 0) > 0 && (
                <StatCard title="Read Notifications" value={profile._count.readNotifications} bgColor="bg-cyan-50 dark:bg-cyan-900/20" />
              )}
              {(profile._count?.Log || 0) > 0 && (
                <StatCard title="Activity Logs" value={profile._count.Log} bgColor="bg-gray-50 dark:bg-gray-700/20" />
              )}
            </div>
          </div>
        )}

        {/* Master Data */}
        {((profile._count?.MasterCategoryCreated || 0) > 0 || (profile._count?.MasterCategoryApproved || 0) > 0 || (profile._count?.MasterMaterialGroupApproved || 0) > 0 || (profile._count?.MasterMaterialGroupCreated || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Master Data</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.MasterCategoryCreated || 0) > 0 && (
                <StatCard 
                  title="Created Categories" 
                  value={profile._count.MasterCategoryCreated} 
                  bgColor="bg-amber-50 dark:bg-amber-900/20"
                />
              )}
              {(profile._count?.MasterCategoryApproved || 0) > 0 && (
                <StatCard 
                  title="Approved Categories" 
                  value={profile._count.MasterCategoryApproved} 
                  bgColor="bg-yellow-50 dark:bg-yellow-900/20"
                />
              )}
              {(profile._count?.MasterMaterialGroupApproved || 0) > 0 && (
                <StatCard 
                  title="Approved Material Groups" 
                  value={profile._count.MasterMaterialGroupApproved} 
                  bgColor="bg-orange-50 dark:bg-orange-900/20"
                />
              )}
              {(profile._count?.MasterMaterialGroupCreated || 0) > 0 && (
                <StatCard 
                  title="Created Material Groups" 
                  value={profile._count.MasterMaterialGroupCreated} 
                  bgColor="bg-red-50 dark:bg-red-900/20"
                />
              )}
            </div>
          </div>
        )}

        {/* Additional Counts */}
        {((profile._count?.approvals || 0) > 0 || (profile._count?.coCreatedAuctions || 0) > 0 || (profile._count?.createdARCReports || 0) > 0 || (profile._count?.createdBuyers || 0) > 0 || (profile._count?.invitedVendors || 0) > 0 || (profile._count?.subordinates || 0) > 0) && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(profile._count?.approvals || 0) > 0 && (
                <StatCard 
                  title="Approvals" 
                  value={profile._count.approvals} 
                  bgColor="bg-lime-50 dark:bg-lime-900/20"
                />
              )}
              {(profile._count?.coCreatedAuctions || 0) > 0 && (
                <StatCard 
                  title="Co-created Auctions" 
                  value={profile._count.coCreatedAuctions} 
                  bgColor="bg-orange-50 dark:bg-orange-900/20"
                />
              )}
              {(profile._count?.createdARCReports || 0) > 0 && (
                <StatCard 
                  title="Created ARC Reports" 
                  value={profile._count.createdARCReports} 
                  bgColor="bg-teal-50 dark:bg-teal-900/20"
                />
              )}
              {(profile._count?.createdBuyers || 0) > 0 && (
                <StatCard 
                  title="Created Buyers" 
                  value={profile._count.createdBuyers} 
                  bgColor="bg-violet-50 dark:bg-violet-900/20"
                />
              )}
              {(profile._count?.invitedVendors || 0) > 0 && (
                <StatCard 
                  title="Invited Vendors" 
                  value={profile._count.invitedVendors} 
                  bgColor="bg-fuchsia-50 dark:bg-fuchsia-900/20"
                />
              )}
              {(profile._count?.subordinates || 0) > 0 && (
                <StatCard 
                  title="Subordinates" 
                  value={profile._count.subordinates} 
                  bgColor="bg-sky-50 dark:bg-sky-900/20"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
