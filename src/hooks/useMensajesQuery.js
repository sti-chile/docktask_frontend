import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createHttpClient } from '../lib/httpClient';

export const useMensajesQuery = (token) => {
  const http = createHttpClient(token);
  const qc = useQueryClient();

  const { data: mensajes = [], isLoading, error, refetch: cargarMensajes } = useQuery({
    queryKey: ['mensajes'],
    queryFn: async () => {
      const data = await http.get('/api/mis-mensajes');
      return Array.isArray(data) ? data : [];
    },
    onError: (error) => toast.error(error.message || 'Error al cargar los mensajes'),
    enabled: !!token
  });

  const crearMensaje = useMutation({
    mutationFn: async (nuevoMensaje) => {
      const mensajeData = {
        ...nuevoMensaje,
        proyecto_id: nuevoMensaje.project_id ? parseInt(nuevoMensaje.project_id) : null
      };
      delete mensajeData.project_id;
      return http.post('/api/mensajes', mensajeData);
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje creado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al crear el mensaje')
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }) => {
      return http.put(`/api/mensajes/${id}`, { estado });
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Estado actualizado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar el estado')
  });

  const eliminarMensaje = useMutation({
    mutationFn: async (id) => {
      return http.delete(`/api/mensajes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje eliminado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al eliminar el mensaje')
  });

  const duplicarMensaje = useMutation({
    mutationFn: async (id) => {
      return http.post(`/api/mis-mensajes/${id}/duplicate`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje duplicado correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al duplicar el mensaje')
  });

  const actualizarFechaExpiracion = useMutation({
    mutationFn: async ({ id, expiration_date }) => {
      if (!expiration_date) throw new Error('La fecha de expiración es requerida');

      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateRegex.test(expiration_date)) {
        throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DDTHH:mm');
      }

      return http.put(`/api/mensajes/${id}`, { expiration_date });
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Fecha de expiración actualizada correctamente');
    },
    onError: (error) => toast.error(error.message || 'Error al actualizar la fecha de expiración')
  });

  return {
    mensajes,
    loading: isLoading,
    isLoading,
    error,
    cargarMensajes,
    crearMensaje,
    cambiarEstado,
    eliminarMensaje,
    duplicarMensaje,
    actualizarFechaExpiracion
  };
};
