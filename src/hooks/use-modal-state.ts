import { useState } from 'react';

interface ApiKey {
  [key: string]: any;
}

export const useModalState = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [viewingKey, setViewingKey] = useState<ApiKey | null>(null);

  const openCreateModal = () => {
    setShowCreateForm(true);
    setEditingKey(null);
    setViewingKey(null);
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setShowCreateForm(false);
    setViewingKey(null);
  };

  const openViewModal = (key: ApiKey) => {
    setViewingKey(key);
    setShowCreateForm(false);
    setEditingKey(null);
  };

  const closeAllModals = () => {
    setShowCreateForm(false);
    setEditingKey(null);
    setViewingKey(null);
  };

  const isModalOpen = showCreateForm || editingKey || viewingKey;

  return {
    showCreateForm,
    editingKey,
    viewingKey,
    isModalOpen,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeAllModals,
  };
};
