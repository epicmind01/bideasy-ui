import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Mail, 
  MessageSquare, 
  Bell, 
  Settings, 
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface AuctionSettingsProps {
  auction: {
    name?: string;
    eventCode?: string;
    startDate?: string;
    endDate?: string;
    timeZone?: string;
    status?: string;
    isPublished?: boolean;
    isPrivate?: boolean;
    allowBidWithdrawal?: boolean;
    showBidderNames?: boolean;
    showCurrentPrice?: boolean;
    showTimeRemaining?: boolean;
    allowNewParticipants?: boolean;
    requireApproval?: boolean;
    maxParticipants?: number;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    enableProxyBidding?: boolean;
    autoExtendEndTime?: boolean;
    extensionDuration?: number;
    bidIncrementType?: 'fixed' | 'percentage';
    bidIncrementValue?: number;
    termsAndConditions?: string;
  };
  onSave?: (settings: any) => void;
}

const AuctionSettings: React.FC<AuctionSettingsProps> = ({ auction, onSave }) => {
  const [settings, setSettings] = useState(auction);
  const [activeSection, setActiveSection] = useState('auction');

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(settings);
  };

  const sections = [
    { id: 'auction', name: 'Auction Details', icon: <Calendar className="h-4 w-4" /> },
    { id: 'bid', name: 'Bid Settings', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'participant', name: 'Participants', icon: <Users className="h-4 w-4" /> },
    { id: 'notification', name: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'advanced', name: 'Advanced', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit}>
          {/* Auction Details Section */}
          {activeSection === 'auction' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Auction Details</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure basic information about your auction
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    value={settings.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="eventCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Code
                  </label>
                  <input
                    type="text"
                    id="eventCode"
                    value={settings.eventCode || ''}
                    onChange={(e) => handleChange('eventCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={settings.startDate ? format(new Date(settings.startDate), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={settings.endDate ? format(new Date(settings.endDate), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Zone
                  </label>
                  <select
                    id="timeZone"
                    value={settings.timeZone || 'Asia/Kolkata'}
                    onChange={(e) => handleChange('timeZone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="UTC">UTC</option>
                    {/* Add more timezones as needed */}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bid Settings Section */}
          {activeSection === 'bid' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Bid Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure how bidding works for your auction
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Bid Increment Type</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose how the bid increment is calculated
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        checked={settings.bidIncrementType === 'fixed'}
                        onChange={() => handleChange('bidIncrementType', 'fixed')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Fixed Amount</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        checked={settings.bidIncrementType === 'percentage'}
                        onChange={() => handleChange('bidIncrementType', 'percentage')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Percentage</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <label htmlFor="bidIncrement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {settings.bidIncrementType === 'percentage' ? 'Bid Increment Percentage' : 'Bid Increment Amount'}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm">
                      {settings.bidIncrementType === 'percentage' ? '%' : '₹'}
                    </span>
                    <input
                      type="number"
                      id="bidIncrement"
                      value={settings.bidIncrementValue || ''}
                      onChange={(e) => handleChange('bidIncrementValue', parseFloat(e.target.value))}
                      className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      min="0"
                      step={settings.bidIncrementType === 'percentage' ? '0.1' : '1'}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Allow Bid Withdrawal</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow participants to withdraw their bids
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.allowBidWithdrawal || false}
                        onChange={(e) => handleChange('allowBidWithdrawal', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Show Bidder Names</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display bidder names to other participants
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.showBidderNames || false}
                        onChange={(e) => handleChange('showBidderNames', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Show Current Price</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display the current highest bid amount
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.showCurrentPrice !== false}
                        onChange={(e) => handleChange('showCurrentPrice', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Show Time Remaining</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display the time remaining in the auction
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.showTimeRemaining !== false}
                        onChange={(e) => handleChange('showTimeRemaining', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participant Settings Section */}
          {activeSection === 'participant' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Participant Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure how participants can join your auction
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Allow New Participants</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow new participants to join the auction
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.allowNewParticipants !== false}
                      onChange={(e) => handleChange('allowNewParticipants', e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Require Approval</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manually approve new participants
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.requireApproval || false}
                      onChange={(e) => handleChange('requireApproval', e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Participants
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="maxParticipants"
                      value={settings.maxParticipants || ''}
                      onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      min="0"
                      placeholder="No limit"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty for unlimited participants
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings Section */}
          {activeSection === 'notification' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure how participants receive notifications
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send email notifications to participants
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.emailNotifications !== false}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send SMS notifications to participants
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.smsNotifications || false}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send push notifications to the mobile app
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.pushNotifications !== false}
                      onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings Section */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure advanced auction settings
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Enable Proxy Bidding</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow participants to enter a maximum bid amount, and the system will automatically bid on their behalf up to that amount.
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.enableProxyBidding || false}
                        onChange={(e) => handleChange('enableProxyBidding', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Auto Extend End Time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically extend the auction end time if there are bids in the last few minutes.
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings.autoExtendEndTime || false}
                        onChange={(e) => handleChange('autoExtendEndTime', e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </div>
                </div>

                {settings.autoExtendEndTime && (
                  <div className="ml-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <label htmlFor="extensionDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extension Duration (minutes)
                      </label>
                      <div className="w-24">
                        <input
                          type="number"
                          id="extensionDuration"
                          value={settings.extensionDuration || 5}
                          onChange={(e) => handleChange('extensionDuration', parseInt(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                          min="1"
                          max="30"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      The auction will be extended by this many minutes if there are bids in the last 5 minutes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => setSettings(auction)}
            >
              <X className="-ml-1 mr-2 h-4 w-4" />
              Discard Changes
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default AuctionSettings;
