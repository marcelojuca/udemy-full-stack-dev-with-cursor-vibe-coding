import { useState } from 'react';

export const useModalState = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [viewingKey, setViewingKey] = useState(null);

  const openCreateModal = () => {
    setShowCreateForm(true);
    setEditingKey(null);
    setViewingKey(null);
  };

  const openEditModal = (key) => {
    setEditingKey(key);
    setShowCreateForm(false);
    setViewingKey(null);
  };

  const openViewModal = (key) => {
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
    closeAllModals
  };
};
