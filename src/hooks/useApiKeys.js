import { useState, useEffect } from 'react';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys', {
        credentials: 'include', // Include session cookies for authentication
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (formData) => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApiKeys();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to create API key' };
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      return { success: false, error: 'Failed to create API key' };
    }
  };

  const updateApiKey = async (id, formData) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApiKeys();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update API key' };
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      return { success: false, error: 'Failed to update API key' };
    }
  };

  const deleteApiKey = async (id) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include session cookies for authentication
      });

      if (response.ok) {
        await fetchApiKeys();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        return { success: false, error: 'Failed to delete API key' };
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { success: false, error: 'Failed to delete API key' };
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return {
    apiKeys,
    loading,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    refetch: fetchApiKeys
  };
};
