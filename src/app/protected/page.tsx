'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Notification from '../../components/Notification';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { getApiKeys, validateApiKey } from '../../lib/apiKeysService';

export default function Protected() {
  const [apiKeyData, setApiKeyData] = useState(null);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const router = useRouter();
  const { sidebarVisible, toggleSidebar } = useSidebar();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    // Get the validated API key data from sessionStorage
    const storedData = sessionStorage.getItem('validatedApiKey');
    if (storedData) {
      try {
        setApiKeyData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing stored API key data:', error);
        window.showToastNotification('Invalid session data', 'error');
        router.push('/playground');
      }
    } else {
      // If no stored data, try to load user's API keys
      if (isAuthenticated) {
        loadUserApiKeys();
      } else {
        window.showToastNotification('No valid session found', 'error');
        router.push('/playground');
      }
    }
    setLoading(false);
  }, [router, isAuthenticated, authLoading]);

  const loadUserApiKeys = async () => {
    try {
      const keys = await getApiKeys();
      setUserApiKeys(keys);
      if (keys.length > 0) {
        setSelectedKeyId(keys[0].id);
        setApiKeyData(keys[0]);
      }
    } catch (error) {
      console.error('Error loading user API keys:', error);
      window.showToastNotification('Failed to load API keys', 'error');
    }
  };

  const handleBackToPlayground = () => {
    sessionStorage.removeItem('validatedApiKey');
    router.push('/playground');
  };

  const handleKeySelection = (keyId) => {
    setSelectedKeyId(keyId);
    const selectedKey = userApiKeys.find(key => key.id === keyId);
    setApiKeyData(selectedKey);
  };

  const handleValidateKey = async (key) => {
    try {
      const result = await validateApiKey(key);
      if (result.valid) {
        window.showToastNotification('API key is valid', 'success');
        setApiKeyData(result.apiKeyData);
      } else {
        window.showToastNotification('Invalid API key', 'error');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      window.showToastNotification('Error validating API key', 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (!apiKeyData && userApiKeys.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Backdrop */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => toggleSidebar()}
          />
        )}
        
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="fixed md:relative z-50 md:z-auto">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarVisible ? (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Protected Area</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboards')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage API Keys
              </button>
              <button
                onClick={handleBackToPlayground}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Back to Playground
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No API Keys Found</h2>
                <p className="text-gray-600 mb-6">You need to create an API key to access the protected area.</p>
                <button
                  onClick={() => router.push('/dashboards')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Create API Key
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Component */}
        <Notification />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Backdrop */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="fixed md:relative z-50 md:z-auto">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarVisible ? (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Protected Area</h1>
          </div>
          <button
            onClick={handleBackToPlayground}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Playground
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">API Key Validated Successfully</h3>
                  <p className="text-sm text-green-700">You have access to the protected area.</p>
                </div>
              </div>
            </div>

            {/* API Key Selection */}
            {userApiKeys.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Select API Key</h2>
                  <p className="text-gray-600 mt-1">Choose an API key to view its details.</p>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-3">
                    {userApiKeys.map((key) => (
                      <div 
                        key={key.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedKeyId === key.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleKeySelection(key.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-medium text-gray-900">{key.name}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                key.key_type === 'production' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {key.key_type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{key.description || 'No description'}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleValidateKey(key.key);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Validate
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* API Key Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">API Key Details</h2>
                <p className="text-gray-600 mt-1">View the details of your validated API key.</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Key Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Key Name
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                    {apiKeyData.name}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[80px]">
                    {apiKeyData.description || 'No description provided'}
                  </div>
                </div>

                {/* Key Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Key Type
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      apiKeyData.key_type === 'production' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {apiKeyData.key_type === 'production' ? 'Production' : 'Development'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {apiKeyData.key_type === 'production' 
                        ? 'Rate limited to 1,000 requests/minute' 
                        : 'Rate limited to 100 requests/minute'
                      }
                    </span>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['create', 'read', 'edit', 'delete', 'admin'].map((permission) => (
                      <div key={permission} className={`flex items-center p-3 border rounded-lg ${
                        apiKeyData.permissions && apiKeyData.permissions.includes(permission)
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className={`w-4 h-4 rounded border-2 mr-3 ${
                          apiKeyData.permissions && apiKeyData.permissions.includes(permission)
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {apiKeyData.permissions && apiKeyData.permissions.includes(permission) && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Monthly Usage Limit
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 ${
                      apiKeyData.limit_usage 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {apiKeyData.limit_usage && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-sm text-gray-900">
                      {apiKeyData.limit_usage ? 'Limited' : 'Unlimited'}
                    </span>
                    {apiKeyData.limit_usage && (
                      <span className="text-sm text-gray-500">
                        ({apiKeyData.monthly_limit || 1000} requests/month)
                      </span>
                    )}
                  </div>
                </div>

                {/* API Key (Masked) */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    API Key
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono">
                    {apiKeyData.key ? `${apiKeyData.key.substring(0, 8)}************************` : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For security reasons, the full API key is not displayed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification />
    </div>
  );
}
