import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createHttpClient } from '../lib/httpClient';
import { useAuth } from '../context/AuthContext';
import { useGuestTareas } from './useGuestStore';

export const useTareasQuery = (token, proyectoId = null) => {
  const { isGuest } = useAuth();
  const http = createHttpClient(token);
  const qc = useQueryClient();

  // ── Guest mode ────────────────────────────────────────────────────────
  const guest = useGuestTareas(token, proyectoId, isGuest);
  if (isGuest) {
    return {
      tareas: guest.tareas,
      loading: guest.isLoading,
      isLoading: guest.isLoading,
      error: guest.error,
      cargarTareas: async () => {},
      crearTarea: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para agregar tareas.'); } },
      cambiarEstado: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para editar tareas.'); } },
      eliminarTarea: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para eliminar tareas.'); } },
      duplicarTarea: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para duplicar tareas.'); } },
      actualizarFechaExpiracion: { mutateAsync: async () => { toast.info('Crea una cuenta gratis para editar fechas.'); } },
    };
  }

  // ── User mode ─────────────────────────────────────────────────────────
  const queryParams = proyectoId ? `?proyecto_id=${proyectoId}` : '';

  const { data: tareas = [], isLoading, error, refetch: cargarTareas } = useQuery({
    queryKey: ['tareas', proyectoId],
    queryFn: async () => {
      const data = await http.get(`/api/v1/mis-tareas${queryParams}`);
      return Array.isArray(data) ? data : [];
    },
    onError: (error) => toast.error(error.message || 'Error al cargar las tareas'),
    enabled: !!token
  });

  const crearTarea = useMutation({
    mutationFn: async (nuevaTarea) => {
      const tareaData = {
        ...nuevaTarea,
        proyecto_id: nuevaTarea.project_id ? parseInt(nuevaTarea.project_id) : null
      };
      delete tareaData.project_id;
      return http.post('/api/v1/tareas', tareaData);
    },
    onSuccess: () => {
      qc.invalidateQueries(['tareas']);
      toast.success('Tarea creada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al crear la tarea')
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }) => {
      return http.put(`/api/v1/tareas/${id}`, { estado });
    },
    onSuccess: () => {
      qc.invalidateQueries(['tareas']);
      toast.success('Estado actualizado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar el estado')
  });

  const eliminarTarea = useMutation({
    mutationFn: async (id) => {
      return http.delete(`/api/v1/tareas/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['tareas']);
      toast.success('Tarea eliminada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al eliminar la tarea')
  });

  const duplicarTarea = useMutation({
    mutationFn: async (id) => {
      return http.post(`/api/v1/mis-tareas/${id}/duplicate`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['tareas']);
      toast.success('Tarea duplicada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al duplicar la tarea')
  });

  const actualizarFechaExpiracion = useMutation({
    mutationFn: async ({ id, expiration_date }) => {
      if (!expiration_date) throw new Error('La fecha de expiración es requerida');

      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateRegex.test(expiration_date)) {
        throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DDTHH:mm');
      }

      return http.put(`/api/v1/tareas/${id}`, { expiration_date });
    },
    onSuccess: () => {
      qc.invalidateQueries(['tareas']);
      toast.success('Fecha de expiración actualizada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar la fecha de expiración')
  });

  return {
    tareas,
    loading: isLoading,
    isLoading,
    error,
    cargarTareas,
    crearTarea,
    cambiarEstado,
    eliminarTarea,
    duplicarTarea,
    actualizarFechaExpiracion
  };
};
