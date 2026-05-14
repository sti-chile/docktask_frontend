import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createHttpClient } from '../lib/httpClient';
import { jwtDecode } from 'jwt-decode';

export const useProjectQuery = (token, workspaceId = null) => {
  const http = createHttpClient(token);
  const qc = useQueryClient();

  const queryParams = workspaceId ? `?workspace_id=${workspaceId}` : '';

  const { data: proyectos = [], isLoading, error } = useQuery({
    queryKey: ['proyectos', workspaceId],
    queryFn: async () => {
      try {
        const proyectos = await http.get(`/api/v1/proyectos${queryParams}`);
        const user = jwtDecode(token);
        const owner_id = user.sub;
        return (proyectos || []).filter(proyecto => String(proyecto.owner_id) === String(owner_id));
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        toast.error('Error al cargar los proyectos');
        return [];
      }
    },
    enabled: !!token,
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000
  });

  const crearProyecto = useMutation({
    mutationFn: async (nuevoProyecto) => {
      return http.post('/api/v1/proyectos', nuevoProyecto);
    },
    onSuccess: () => {
      qc.invalidateQueries(['proyectos']);
      toast.success('Proyecto creado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al crear el proyecto')
  });

  const actualizarProyecto = useMutation({
    mutationFn: async ({ id, ...datos }) => {
      return http.put(`/api/v1/proyectos/${id}`, datos);
    },
    onSuccess: () => {
      qc.invalidateQueries(['proyectos']);
      toast.success('Proyecto actualizado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar el proyecto')
  });

  const eliminarProyecto = useMutation({
    mutationFn: async (id) => {
      return http.delete(`/api/v1/proyectos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['proyectos']);
      toast.success('Proyecto eliminado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al eliminar el proyecto')
  });

  return {
    proyectos,
    isLoading,
    error,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
  };
};
