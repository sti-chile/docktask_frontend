import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { buildAxios } from '../api/axiosInstance';

export const useWorkspaceQuery = (token) => {
  const axios = buildAxios(token);
  const qc = useQueryClient();

  const { data: workspaces = [], isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/workspaces/');
        return response.data || [];
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
      const response = await axios.post('/api/workspaces/', datos);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace creado correctamente');
    },
    onError: () => {
      toast.error('Error al crear el workspace');
    },
  });

  const actualizarWorkspace = useMutation({
    mutationFn: async ({ id, ...datos }) => {
      const response = await axios.put(`/api/workspaces/${id}`, datos);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el workspace');
    },
  });

  const eliminarWorkspace = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/workspaces/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el workspace');
    },
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
