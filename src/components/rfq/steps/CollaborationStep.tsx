import React, { useState, useEffect, useMemo } from 'react';
import { useRFQContext } from '../../../context/RFQContext';
import { Input } from '../../ui/input';
import {
  useGetUsersForRFQApi,
} from '../../../hooks/API/useCreateRFQApis';

interface Collaborator {
  collaboratorId: string;
  role: string;
  name: string;
  email: string;
  roles?: string[];
}

const CollaborationStep: React.FC = () => {
  const {
    updateFormData,
    search,
    setSearch,
  } = useRFQContext();

  const [observerArr, setObserverArr] = useState<Collaborator[]>([]);
  const [coBuyerArr, setCoBuyerArr] = useState<Collaborator[]>([]);
  const [buyerArr, setBuyerArr] = useState<Collaborator[]>([]);

  const { data: users, isLoading: loadingUsers } = useGetUsersForRFQApi({
    page: 1,
    limit: 50,
    search: search
  });

  // Update form data when collaborator arrays change
  useEffect(() => {
    const allCollaborators = [...observerArr, ...coBuyerArr, ...buyerArr];
    updateFormData({
      collaborators: allCollaborators.map(collab => collab.collaboratorId),
      collaboratorsWithRoles: allCollaborators
    });
  }, [observerArr, coBuyerArr, buyerArr, updateFormData]);

  // Transform users data for multiselect
  const userOptions = useMemo(() => {
    if (!users?.users) return [];
    
    return users.users.map((user: any) => ({
      collaboratorId: user.id,
      name: `${user.name || user.firstName + ' ' + user.lastName} (${user.email})`,
      email: user.email,
      roles: user.roles || [user.role || user.designation || 'User']
    }));
  }, [users?.users]);

  const handleObserverSelect = (selectedList: Collaborator[]) => {
    setObserverArr(selectedList);
  };

  const handleObserverRemove = (removedList: Collaborator[]) => {
    setObserverArr(removedList);
  };

  const handleCoBuyerSelect = (selectedList: Collaborator[]) => {
    setCoBuyerArr(selectedList);
  };

  const handleCoBuyerRemove = (removedList: Collaborator[]) => {
    setCoBuyerArr(removedList);
  };

  const handleBuyerSelect = (selectedList: Collaborator[]) => {
    setBuyerArr(selectedList);
  };

  const handleBuyerRemove = (removedList: Collaborator[]) => {
    setBuyerArr(removedList);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Add Collaborators</h3>
        <p className="text-sm text-gray-600 mb-4">
          Invite team members to collaborate on this RFQ with specific roles.
        </p>
        
        {/* User Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
        </div>

        <div className="flex flex-col gap-8">
          {/* Observer Selection */}
          <div className="relative mb-6 group" style={{ zIndex: 2000 }}>
            <label
              htmlFor="observer"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Add as Observer
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[50px] bg-gray-50">
              {loadingUsers ? (
                <div className="text-center text-gray-500">Loading users...</div>
              ) : userOptions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOptions.map((user: Collaborator) => (
                    <div key={user.collaboratorId} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-100">
                      <input
                        type="checkbox"
                        id={`observer-${user.collaboratorId}`}
                        checked={observerArr.some(obs => obs.collaboratorId === user.collaboratorId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleObserverSelect([...observerArr, { ...user, role: 'OBSERVER' }]);
                          } else {
                            handleObserverRemove(observerArr.filter(obs => obs.collaboratorId !== user.collaboratorId));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor={`observer-${user.collaboratorId}`} className="font-medium text-gray-900 cursor-pointer">
                          {user.name}
                        </label>
                        <p className="text-sm text-gray-500">
                          {user.roles?.join(', ') || 'User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No users available</div>
              )}
            </div>
            {observerArr.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Selected Observers:</p>
                <div className="flex flex-wrap gap-1">
                  {observerArr.map((observer) => (
                    <span key={observer.collaboratorId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {observer.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Co-Buyer Selection */}
          <div className="relative mb-6 group" style={{ zIndex: 1900 }}>
            <label
              htmlFor="co-buyer"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Add as Co-Buyer
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[50px] bg-gray-50">
              {loadingUsers ? (
                <div className="text-center text-gray-500">Loading users...</div>
              ) : userOptions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOptions.map((user: Collaborator) => (
                    <div key={user.collaboratorId} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-100">
                      <input
                        type="checkbox"
                        id={`cobuyer-${user.collaboratorId}`}
                        checked={coBuyerArr.some(cb => cb.collaboratorId === user.collaboratorId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleCoBuyerSelect([...coBuyerArr, { ...user, role: 'CO_BUYER' }]);
                          } else {
                            handleCoBuyerRemove(coBuyerArr.filter(cb => cb.collaboratorId !== user.collaboratorId));
                          }
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor={`cobuyer-${user.collaboratorId}`} className="font-medium text-gray-900 cursor-pointer">
                          {user.name}
                        </label>
                        <p className="text-sm text-gray-500">
                          {user.roles?.join(', ') || 'User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No users available</div>
              )}
            </div>
            {coBuyerArr.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Selected Co-Buyers:</p>
                <div className="flex flex-wrap gap-1">
                  {coBuyerArr.map((cobuyer) => (
                    <span key={cobuyer.collaboratorId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {cobuyer.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buyer Selection */}
          <div className="relative mb-6 group" style={{ zIndex: 1800 }}>
            <label
              htmlFor="buyer"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Transfer to Buyer
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[50px] bg-gray-50">
              {loadingUsers ? (
                <div className="text-center text-gray-500">Loading users...</div>
              ) : userOptions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOptions.map((user: Collaborator) => (
                    <div key={user.collaboratorId} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-100">
                      <input
                        type="checkbox"
                        id={`buyer-${user.collaboratorId}`}
                        checked={buyerArr.some(b => b.collaboratorId === user.collaboratorId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleBuyerSelect([...buyerArr, { ...user, role: 'BUYER' }]);
                          } else {
                            handleBuyerRemove(buyerArr.filter(b => b.collaboratorId !== user.collaboratorId));
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor={`buyer-${user.collaboratorId}`} className="font-medium text-gray-900 cursor-pointer">
                          {user.name}
                        </label>
                        <p className="text-sm text-gray-500">
                          {user.roles?.join(', ') || 'User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No users available</div>
              )}
            </div>
            {buyerArr.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Selected Buyers:</p>
                <div className="flex flex-wrap gap-1">
                  {buyerArr.map((buyer) => (
                    <span key={buyer.collaboratorId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {buyer.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Collaboration Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-600">Observers:</span> {observerArr.length}
            </div>
            <div>
              <span className="font-medium text-green-600">Co-Buyers:</span> {coBuyerArr.length}
            </div>
            <div>
              <span className="font-medium text-purple-600">Buyers:</span> {buyerArr.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationStep;
