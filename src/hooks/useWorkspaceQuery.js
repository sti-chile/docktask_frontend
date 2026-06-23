import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createHttpClient } from '../lib/httpClient';
import { useAuth } from '../context/AuthContext';
import { useGuestWorkspace } from './useGuestStore';

export const useWorkspaceQuery = (token) => {
  const { isGuest } = useAuth();
  const http = createHttpClient(token);
  const qc = useQueryClient();

  // ── Guest mode ────────────────────────────────────────────────────────
  const guest = useGuestWorkspace(token, isGuest);
  if (isGuest) {
    return {
      workspaces: guest.workspaces,
      isLoading: guest.isLoading,
      error: guest.error,
      crearWorkspace: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para crear espacios.'); } },
      actualizarWorkspace: { mutateAsync: async () => { toast.info('Los invitados no pueden editar workspaces.'); } },
      eliminarWorkspace: { mutateAsync: async () => { toast.info('Los invitados no pueden eliminar workspaces.'); } },
    };
  }

  // ── User mode ─────────────────────────────────────────────────────────
  const { data: workspaces = [], isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      try {
        const data = await http.get('/api/v1/workspaces/');
        return data || [];
      } catch (error) {
        console.error('Error al cargar workspaces:', error);
        toast.error('Error al cargar los workspaces');
        return [];
      }
    },
    enabled: !!token,
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
  });

  const crearWorkspace = useMutation({
    mutationFn: async (datos) => {
      return http.post('/api/v1/workspaces/', datos);
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace creado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al crear el workspace'),
  });

  const actualizarWorkspace = useMutation({
    mutationFn: async ({ id, ...datos }) => {
      return http.put(`/api/v1/workspaces/${id}`, datos);
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace actualizado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar el workspace'),
  });

  const eliminarWorkspace = useMutation({
    mutationFn: async (id) => {
      return http.delete(`/api/v1/workspaces/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace eliminado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al eliminar el workspace'),
  });

  return {
    workspaces,
    isLoading,
    error,
    crearWorkspace,
    actualizarWorkspace,
    eliminarWorkspace,
  };
};
