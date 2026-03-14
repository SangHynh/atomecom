import { useState, useCallback } from 'react';

interface StudioManagerState {
  selectedId: string | null;
  editingId: string | null;
  isFormOpen: boolean;
  isDetailOpen: boolean;
}

export function useStudioManager() {
  const [state, setState] = useState<StudioManagerState>({
    selectedId: null,
    editingId: null,
    isFormOpen: false,
    isDetailOpen: false,
  });

  const openForm = useCallback((id: string | null = null) => {
    setState((prev) => ({
      ...prev,
      editingId: id,
      isFormOpen: true,
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

  const closeAll = useCallback(() => {
    setState({
      selectedId: null,
      editingId: null,
      isFormOpen: false,
      isDetailOpen: false,
    });
  }, []);

  return {
    ...state,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
    closeAll,
  };
}
