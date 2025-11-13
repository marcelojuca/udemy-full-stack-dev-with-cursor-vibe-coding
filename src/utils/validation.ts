interface FormData {
  name: string;
  keyType: string;
  permissions: string[];
}

export const validateApiKeyForm = (formData: FormData) => {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Key Name is required');
  }

  if (!formData.keyType) {
    errors.push('Key Type is required');
  }

  if (!formData.permissions || formData.permissions.length === 0) {
    errors.push('At least one permission is required');
  }

  return errors;
};
