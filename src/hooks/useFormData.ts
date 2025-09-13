import { useState } from 'react';

const initialFormData = {
  name: '',
  description: '',
  permissions: [],
  keyType: 'development',
  limitUsage: false,
  monthlyLimit: 1000
};

export const useFormData = () => {
  const [formData, setFormData] = useState(initialFormData);

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const populateFormData = (key) => {
    setFormData({
      name: key.name,
      description: key.description,
      permissions: key.permissions || [],
      keyType: key.key_type || 'development',
      limitUsage: key.limit_usage || false,
      monthlyLimit: key.monthly_limit || 1000
    });
  };

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return {
    formData,
    updateFormData,
    resetFormData,
    populateFormData,
    togglePermission
  };
};
