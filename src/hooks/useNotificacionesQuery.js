import { createHttpClient } from "../lib/httpClient"

export const useNotificacionesQuery = (token) => {
    const http = createHttpClient(token)

    const getNotificaciones = async ({ limit = 20 } = {}) => {
        const data = await http.get(`/api/v1/notificaciones?limit=${limit}`)
        return data
    }

    const marcarLeida = async (id) => {
        return http.put(`/api/v1/notificaciones/${id}/leida`)
    }

    const marcarTodasLeidas = async () => {
        return http.put("/api/v1/notificaciones/leer-todas")
    }

    return { getNotificaciones, marcarLeida, marcarTodasLeidas }
}
