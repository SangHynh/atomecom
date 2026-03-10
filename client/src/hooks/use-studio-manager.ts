import { useState, useCallback } from 'react';

interface StudioManagerState {
  selectedId: string | null;
  editingId: string | null;
  isFormOpen: boolean;
  isDetailOpen: boolean;
  confirmDelete: {
    isOpen: boolean;
    id: string;
  };
}

export function useStudioManager() {
  const [state, setState] = useState<StudioManagerState>({
    selectedId: null,
    editingId: null,
    isFormOpen: false,
    isDetailOpen: false,
    confirmDelete: { isOpen: false, id: '' },
  });

  const openForm = useCallback((id: string | null = null) => {
    setState((prev) => ({
      ...prev,
      editingId: id,
      isFormOpen: true,
      // If we open form, we might want to close detail or keep it (Detail handles its own edit mode)
    }));
  }, []);

  const closeForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isFormOpen: false,
      editingId: null,
    }));
  }, []);

  const openDetail = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedId: id,
      isDetailOpen: true,
    }));
  }, []);

  const closeDetail = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDetailOpen: false,
      selectedId: null,
    }));
  }, []);

  const openDeleteConfirm = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      confirmDelete: { isOpen: true, id },
    }));
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      confirmDelete: { isOpen: false, id: '' },
    }));
  }, []);

  const closeAll = useCallback(() => {
    setState({
      selectedId: null,
      editingId: null,
      isFormOpen: false,
      isDetailOpen: false,
      confirmDelete: { isOpen: false, id: '' },
    });
  }, []);

  return {
    ...state,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
    openDeleteConfirm,
    closeDeleteConfirm,
    closeAll,
  };
}
