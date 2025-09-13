'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Notification from '../../components/Notification';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { getApiKeys, validateApiKey } from '../../lib/apiKeysService';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [userApiKeys, setUserApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserKeys, setShowUserKeys] = useState(false);
  const router = useRouter();
  const { sidebarVisible, toggleSidebar } = useSidebar();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Load user's API keys if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserApiKeys();
    }
  }, [isAuthenticated]);

  const loadUserApiKeys = async () => {
    try {
      const keys = await getApiKeys();
      setUserApiKeys(keys);
    } catch (error) {
      console.error('Error loading user API keys:', error);
      // Don't show error notification for this as it's not critical
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      window.showToastNotification('Please enter an API key', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const data = await validateApiKey(apiKey.trim());

      if (data.valid) {
        window.showToastNotification('Valid API key', 'success');
        // Store the API key data in sessionStorage for the protected page
        sessionStorage.setItem('validatedApiKey', JSON.stringify(data.apiKeyData));
        // Navigate to protected page after a short delay
        setTimeout(() => {
          router.push('/protected');
        }, 1000);
      } else {
        window.showToastNotification('Invalid API key', 'error');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      window.showToastNotification('Error validating API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUserKey = (key) => {
    setApiKey(key.key);
    setShowUserKeys(false);
  };

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
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Validator</h2>
                <p className="text-gray-600">
                  Enter your API key below to validate it and access the protected area.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-black">
                      API Key
                    </label>
                    {isAuthenticated && userApiKeys.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowUserKeys(!showUserKeys)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showUserKeys ? 'Hide' : 'Use My Keys'} ({userApiKeys.length})
                      </button>
                    )}
                  </div>
                  
                  {/* User API Keys Dropdown */}
                  {showUserKeys && userApiKeys.length > 0 && (
                    <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {userApiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectUserKey(key)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{key.name}</h4>
                              <p className="text-xs text-gray-500">{key.description || 'No description'}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              key.key_type === 'production' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {key.key_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <input
                    type="text"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-600"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Your API key will be validated against our database.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Validate API Key</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">How it works</h3>
                      <p className="text-sm text-blue-800">
                        Enter your API key to validate it against our database. If valid, you&apos;ll be redirected to a protected area where you can view your API key details.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => router.push('/dashboards')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Manage Your API Keys →
                    </button>
                  </div>
                )}
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
