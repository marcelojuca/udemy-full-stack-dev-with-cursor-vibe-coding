'use client'

import Link from 'next/link';
import Sidebar from './sidebar';
import Notification from './notification';
import PlanCard from './plan-card';
import TopBar from './top-bar';
import APIKeyTable from './api-key-table';
import APIKeyModal from './api-key-modal';
import ContactSection from './contact-section';
import Footer from './footer';
import LoadingSpinner from './loading-spinner';
import GoogleLoginButton from './google-login-button';
import UserProfile from './user-profile';
import { useApiKeys } from '../hooks/use-api-keys';
import { useFormData } from '../hooks/use-form-data';
import { useModalState } from '../hooks/use-modal-state';
import { useSidebar } from '../hooks/use-sidebar';
import { useAuth } from '../contexts/auth-context';
import { validateApiKeyForm } from '../utils/validation';

export default function DashboardWrapper() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey } = useApiKeys();
  const { formData, updateFormData, resetFormData, populateFormData, togglePermission } = useFormData();
  const { 
    showCreateForm, 
    editingKey, 
    viewingKey, 
    isModalOpen, 
    openCreateModal, 
    openEditModal, 
    openViewModal, 
    closeAllModals 
  } = useModalState();
  const { sidebarVisible, toggleSidebar } = useSidebar();

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateApiKeyForm(formData);
    if (validationErrors.length > 0) {
      window.showToastNotification(validationErrors.join(', '), 'error');
      return;
    }
    
    const result = await createApiKey(formData);
    if (result.success) {
      closeAllModals();
      resetFormData();
      window.showToastNotification('API key created successfully!', 'success');
    } else {
      window.showToastNotification(result.error, 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateApiKeyForm(formData);
    if (validationErrors.length > 0) {
      window.showToastNotification(validationErrors.join(', '), 'error');
      return;
    }
    
    const result = await updateApiKey(editingKey.id, formData);
    if (result.success) {
      closeAllModals();
      resetFormData();
      window.showToastNotification('API key updated successfully!', 'success');
    } else {
      window.showToastNotification(result.error, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      const result = await deleteApiKey(id);
      if (result.success) {
        window.showToastNotification('API key deleted successfully!', 'success');
      } else {
        window.showToastNotification(result.error, 'error');
      }
    }
  };

  const handleEdit = (key) => {
    populateFormData(key);
    openEditModal(key);
  };

  const handleView = (key) => {
    populateFormData(key);
    openViewModal(key);
  };

  const handleModalClose = () => {
    closeAllModals();
    resetFormData();
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Welcome to API Key Manager
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in with your Google account to access the dashboard
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <GoogleLoginButton className="w-full" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Backdrop */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="fixed lg:relative z-50 lg:z-auto w-64">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-auto">
          <PlanCard />

          {/* API Keys Section */}
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
                <button
                  onClick={openCreateModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-muted-foreground mt-2">
                The key is used to authenticate your requests to the Research API. To learn more, see the{' '}
                <Link href="/docs" className="text-primary hover:underline">documentation page</Link>.
              </p>
            </div>
            <APIKeyTable 
              apiKeys={apiKeys}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          <ContactSection />
        </div>

        <Footer />
      </div>

      {/* Create/Edit/View Modal */}
      <APIKeyModal
        isOpen={isModalOpen}
        showCreateForm={showCreateForm}
        editingKey={editingKey}
        viewingKey={viewingKey}
        formData={formData}
        onClose={handleModalClose}
        onSubmit={editingKey ? handleUpdate : handleCreate}
        onFormDataChange={updateFormData}
        onTogglePermission={togglePermission}
      />

      {/* Notification Component */}
      <Notification />
    </div>
  );
}
