// stores/workspaceStore.js
import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  activeWorkspace: null,
  setWorkspaces: (ws) => set({ workspaces: ws }),
  setActiveWorkspace: (id) => set({ activeWorkspace: id }),
}));
