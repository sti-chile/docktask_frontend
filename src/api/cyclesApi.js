// Cycles API — operaciones CRUD para ciclos (sprints) y asignación de tareas
import { createHttpClient } from '../lib/httpClient';

export const apiCycles = (token) => {
  const api = createHttpClient(token);

  return {
    // ── Ciclos ──────────────────────────────────────────────────
    list: (workspaceId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const url = `/api/v1/workspaces/${workspaceId}/cycles${qs ? `?${qs}` : ''}`;
      return api.get(url);
    },

    get: (workspaceId, cycleId) =>
      api.get(`/api/v1/workspaces/${workspaceId}/cycles/${cycleId}`),

    create: (workspaceId, payload) =>
      api.post(`/api/v1/workspaces/${workspaceId}/cycles`, payload),

    update: (workspaceId, cycleId, payload) =>
      api.patch(`/api/v1/workspaces/${workspaceId}/cycles/${cycleId}`, payload),

    delete: (workspaceId, cycleId) =>
      api.delete(`/api/v1/workspaces/${workspaceId}/cycles/${cycleId}`),

    // ── Acciones ────────────────────────────────────────────────
    activate: (workspaceId, cycleId) =>
      api.post(`/api/v1/workspaces/${workspaceId}/cycles/${cycleId}/activate`),

    complete: (workspaceId, cycleId) =>
      api.post(`/api/v1/workspaces/${workspaceId}/cycles/${cycleId}/complete`),

    // ── Tareas en ciclos ────────────────────────────────────────
    assignTask: (taskId, cycleId) =>
      api.post(`/api/v1/tasks/${taskId}/cycle`, { cycle_id: cycleId }),

    removeTask: (taskId) =>
      api.delete(`/api/v1/tasks/${taskId}/cycle`),

    changeTaskCycle: (taskId, cycleId) =>
      api.patch(`/api/v1/tasks/${taskId}/cycle`, { cycle_id: cycleId }),
  };
};
