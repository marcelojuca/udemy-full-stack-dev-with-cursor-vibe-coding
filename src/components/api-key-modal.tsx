import Link from 'next/link';

interface APIKeyModalProps {
  isOpen: boolean;
  showCreateForm: boolean;
  editingKey: any;
  viewingKey: any;
  formData: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: any) => void;
  onTogglePermission: (permission: string) => void;
}

export default function APIKeyModal({
  isOpen,
  showCreateForm,
  editingKey,
  viewingKey,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
  onTogglePermission
}: APIKeyModalProps) {
  const availablePermissions = ['create', 'read', 'edit', 'delete', 'admin'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {viewingKey ? 'View API Key' : editingKey ? 'Edit API Key' : 'Create a new API key'}
          </h3>
          <p className="text-gray-600 mb-6">
            {viewingKey ? 'View the details of this API key.' : editingKey ? 'Update the API key details below.' : 'Enter the details for the new API key.'}
          </p>
          
          <form onSubmit={viewingKey ? (e) => e.preventDefault() : onSubmit} className="space-y-6">
            {/* Key Name */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Key Name <span className="text-red-500">*</span> — A unique name to identify this key
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFormDataChange({ name: e.target.value })}
                placeholder="Key Name"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-600 ${viewingKey ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                required
                readOnly={!!viewingKey}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description — Optional description for this API key
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormDataChange({ description: e.target.value })}
                placeholder="Enter a description for this API key..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-600 ${viewingKey ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                rows={3}
                readOnly={!!viewingKey}
              />
            </div>

            {/* Key Type */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Key Type <span className="text-red-500">*</span> — Choose the environment for this key
              </label>
              <div className="space-y-3">
                {/* Development Option */}
                <div 
                  className={`border rounded-lg p-4 transition-colors ${
                    formData.keyType === 'development' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${viewingKey ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={viewingKey ? undefined : () => onFormDataChange({ keyType: 'development' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.keyType === 'development' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {formData.keyType === 'development' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <div>
                        <div className={`font-medium ${
                          formData.keyType === 'development' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Development
                        </div>
                        <div className="text-sm text-gray-500">Rate limited to 100 requests/minute</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Option */}
                <div 
                  className={`border rounded-lg p-4 transition-colors ${
                    formData.keyType === 'production' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${viewingKey ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={viewingKey ? undefined : () => onFormDataChange({ keyType: 'production' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.keyType === 'production' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {formData.keyType === 'production' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <div className={`font-medium ${
                          formData.keyType === 'production' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Production
                        </div>
                        <div className="text-sm text-gray-500">Rate limited to 1,000 requests/minute</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Permissions <span className="text-red-500">*</span> — Select the permissions for this API key
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <label key={permission} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.permissions.includes(permission) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${viewingKey ? 'cursor-default' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => onTogglePermission(permission)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!!viewingKey}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                      {permission}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select the permissions this API key should have. Admin permission includes all other permissions.
              </p>
            </div>

            {/* Monthly Usage Limit */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="limitUsage"
                  checked={formData.limitUsage}
                  onChange={(e) => onFormDataChange({ limitUsage: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!!viewingKey}
                />
                <label htmlFor="limitUsage" className="text-sm font-medium text-black">
                  Limit monthly usage*
                </label>
              </div>
              {formData.limitUsage && (
                <input
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => onFormDataChange({ monthlyLimit: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${viewingKey ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  min="1"
                  max="10"
                  readOnly={!!viewingKey}
                />
              )}
              <p className="text-xs text-gray-500 mt-2">
                * If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be rejected.
              </p>
            </div>

            {/* Required Fields Note */}
            {!viewingKey && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="text-red-500">*</span> Required fields: Key Name, Key Type, and at least one Permission must be selected.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {viewingKey ? 'Close' : 'Cancel'}
              </button>
              {!viewingKey && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingKey ? 'Update' : 'Create'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
