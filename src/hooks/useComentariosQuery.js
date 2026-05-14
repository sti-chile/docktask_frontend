import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createHttpClient } from '../lib/httpClient';

export const useComentariosQuery = (token, tareaId) => {
  const http = createHttpClient(token);
  const qc = useQueryClient();

  const { data: comentarios = [], isLoading } = useQuery({
    queryKey: ['comentarios', tareaId],
    queryFn: async () => {
      if (!tareaId) return [];
      const data = await http.get(`/api/v1/tareas/${tareaId}/comentarios`);
      return Array.isArray(data) ? data : [];
    },
    onError: (error) => toast.error(error.message || 'Error al cargar comentarios'),
    enabled: !!token && !!tareaId
  });

  const crearComentario = useMutation({
    mutationFn: async ({ contenido }) => {
      return http.post(`/api/v1/tareas/${tareaId}/comentarios`, { contenido });
    },
    onSuccess: () => {
      qc.invalidateQueries(['comentarios', tareaId]);
      toast.success('Comentario agregado');
    },
    onError: (error) => toast.error(error.message || 'Error al agregar comentario')
  });

  const eliminarComentario = useMutation({
    mutationFn: async (comentarioId) => {
      return http.delete(`/api/v1/comentarios/${comentarioId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['comentarios', tareaId]);
      toast.success('Comentario eliminado');
    },
    onError: (error) => toast.error(error.message || 'Error al eliminar comentario')
  });

  return {
    comentarios,
    isLoading,
    crearComentario,
    eliminarComentario
  };
};
