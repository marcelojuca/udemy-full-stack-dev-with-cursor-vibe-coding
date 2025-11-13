import { useState } from 'react';

interface FormData {
  name: string;
  description: string;
  permissions: string[];
  keyType: string;
  limitUsage: boolean;
  monthlyLimit: number;
}

interface ApiKey {
  name: string;
  description: string;
  permissions?: string[];
  key_type?: string;
  limit_usage?: boolean;
  monthly_limit?: number;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  permissions: [],
  keyType: 'development',
  limitUsage: true,
  monthlyLimit: 5,
};

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const populateFormData = (key: ApiKey) => {
    setFormData({
      name: key.name,
      description: key.description,
      permissions: key.permissions || [],
      keyType: key.key_type || 'development',
      limitUsage: key.limit_usage ?? true,
      monthlyLimit: typeof key.monthly_limit === 'number' ? key.monthly_limit : 5,
    });
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return {
    formData,
    updateFormData,
    resetFormData,
    populateFormData,
    togglePermission,
  };
};
