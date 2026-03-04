import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { buildAxios } from '../api/axiosInstance';

export const useMensajesQuery = (token) => {
  const axios = buildAxios(token);
  const qc = useQueryClient();

  const { data: mensajes = [], isLoading, error, refetch: cargarMensajes } = useQuery({
    queryKey: ['mensajes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/mis-mensajes');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
        toast.error('Error al cargar los mensajes');
        return [];
      }
    },
    enabled: !!token
  });

  const crearMensaje = useMutation({
    mutationFn: async (nuevoMensaje) => {
      try {
        // Cambiar la clave a proyecto_id y eliminar project_id
        const mensajeData = {
          ...nuevoMensaje,
          proyecto_id: nuevoMensaje.project_id ? parseInt(nuevoMensaje.project_id) : null
        };
        delete mensajeData.project_id;
        
        console.log('Enviando datos:', mensajeData); // Para debugging
        const response = await axios.post('/api/mensajes', mensajeData);
        return response.data;
      } catch (error) {
        console.error('Error al crear mensaje:', error.response?.data || error);
        const errorMessage = error.response?.data?.message || 'Error al crear el mensaje';
        toast.error(errorMessage);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje creado correctamente');
    }
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }) => {
      try {
        const response = await axios.put(`/api/mensajes/${id}`, { estado });
        return response.data;
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        toast.error('Error al actualizar el estado');
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Estado actualizado correctamente');
    }
  });

  const eliminarMensaje = useMutation({
    mutationFn: async (id) => {
      try {
        await axios.delete(`/api/mensajes/${id}`);
      } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        toast.error('Error al eliminar el mensaje');
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje eliminado correctamente');
    }
  });

  const duplicarMensaje = useMutation({
    mutationFn: async (id) => {
      try {
        const response = await axios.post(`/api/mis-mensajes/${id}/duplicate`);
        return response.data;
      } catch (error) {
        console.error('Error al duplicar mensaje:', error.response?.data || error);
        toast.error('Error al duplicar el mensaje');
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Mensaje duplicado correctamente');
    }
  });

  const actualizarFechaExpiracion = useMutation({
    mutationFn: async ({ id, expiration_date }) => {
      try {
        console.log('useMensajesQuery - Fecha recibida:', expiration_date);
        console.log('useMensajesQuery - Tipo de fecha recibida:', typeof expiration_date);

        if (!expiration_date) {
          throw new Error('La fecha de expiración es requerida');
        }

        // Validar que la fecha tenga el formato correcto YYYY-MM-DDTHH:mm
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (!dateRegex.test(expiration_date)) {
          console.error('useMensajesQuery - Formato de fecha inválido:', expiration_date);
          throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DDTHH:mm');
        }

        console.log('useMensajesQuery - Enviando al servidor:', { id, expiration_date });
        const response = await axios.put(`/api/mensajes/${id}`, { expiration_date });
        console.log('useMensajesQuery - Respuesta del servidor:', response.data);
        return response.data;
      } catch (error) {
        console.error('useMensajesQuery - Error completo:', error);
        toast.error(error.message || 'Error al actualizar la fecha de expiración');
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['mensajes']);
      toast.success('Fecha de expiración actualizada correctamente');
    }
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
