/**
 * useNotificacionesQuery — REST API para notificaciones
 */
import { createHttpClient } from '../lib/httpClient';

const useNotificacionesQuery = (token) => {
  const client = createHttpClient(token);

  const getNotificaciones = async (soloNoLeidas = false) => {
    const params = soloNoLeidas ? '?no_leidas=true' : '';
    return client.get(`/api/v1/notificaciones${params}`);
  };

  const marcarLeida = async (id) => {
    return client.put(`/api/v1/notificaciones/${id}/leida`);
  };

  const marcarTodasLeidas = async () => {
    return client.put('/api/v1/notificaciones/leer-todas');
  };

  return { getNotificaciones, marcarLeida, marcarTodasLeidas };
};

export default useNotificacionesQuery;
