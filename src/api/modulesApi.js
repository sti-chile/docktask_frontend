// Modules API — operaciones CRUD para módulos y asignación de tareas
import { createHttpClient } from '../lib/httpClient';

export const apiModules = (token) => {
  const api = createHttpClient(token);

  return {
    // ── Módulos ──────────────────────────────────────────────────
    list: (workspaceId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const url = `/api/v1/workspaces/${workspaceId}/modules${qs ? `?${qs}` : ''}`;
      return api.get(url);
    },

    get: (workspaceId, moduleId) =>
      api.get(`/api/v1/workspaces/${workspaceId}/modules/${moduleId}`),

    create: (workspaceId, payload) =>
      api.post(`/api/v1/workspaces/${workspaceId}/modules`, payload),

    update: (workspaceId, moduleId, payload) =>
      api.patch(`/api/v1/workspaces/${workspaceId}/modules/${moduleId}`, payload),

    delete: (workspaceId, moduleId) =>
      api.delete(`/api/v1/workspaces/${workspaceId}/modules/${moduleId}`),

    // ── Acciones ────────────────────────────────────────────────
    archive: (workspaceId, moduleId) =>
      api.post(`/api/v1/workspaces/${workspaceId}/modules/${moduleId}/archive`),

    // ── Tareas en módulos ────────────────────────────────────────
    assignTask: (taskId, moduleId) =>
      api.post(`/api/v1/tasks/${taskId}/modules`, { module_id: moduleId }),

    removeTask: (taskId, moduleId) =>
      api.delete(`/api/v1/tasks/${taskId}/modules/${moduleId}`),

    getTasks: (workspaceId, moduleId) =>
      api.get(`/api/v1/workspaces/${workspaceId}/tasks?module_id=${moduleId}`),
  };
};
