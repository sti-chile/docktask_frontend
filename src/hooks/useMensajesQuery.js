import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { buildAxios } from '../api/axiosInstance';

export const useMensajesQuery = (token) => {
  const axios = buildAxios(token);
  const qc = useQueryClient();

  const { data: mensajes = [], isLoading, error, refetch: cargarMensajes } = useQuery({
    queryKey: ['mensajes'],
    queryFn: async () => {
      const response = await axios.get('/api/mis-mensajes');
      return Array.isArray(response.data) ? response.data : [];
    },
    onError: () => toast.error('Error al cargar los mensajes'),
    enabled: !!token
  });

  const crearMensaje = useMutation({
    mutationFn: async (nuevoMensaje) => {
      const mensajeData = {
        ...nuevoMensaje,
        proyecto_id: nuevoMensaje.project_id ? parseInt(nuevoMensaje.project_id) : null
      };
      delete mensajeData.project_id;
      const response = await axios.post('/api/mensajes', mensajeData);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje creado correctamente');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el mensaje';
      toast.error(errorMessage);
    }
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }) => {
      const response = await axios.put(`/api/mensajes/${id}`, { estado });
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Estado actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el estado')
  });

  const eliminarMensaje = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/mensajes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar el mensaje')
  });

  const duplicarMensaje = useMutation({
    mutationFn: async (id) => {
      const response = await axios.post(`/api/mis-mensajes/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje duplicado correctamente');
    },
    onError: () => toast.error('Error al duplicar el mensaje')
  });

  const actualizarFechaExpiracion = useMutation({
    mutationFn: async ({ id, expiration_date }) => {
      if (!expiration_date) throw new Error('La fecha de expiración es requerida');

      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateRegex.test(expiration_date)) {
        throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DDTHH:mm');
      }

      const response = await axios.put(`/api/mensajes/${id}`, { expiration_date });
      return response.data;
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
