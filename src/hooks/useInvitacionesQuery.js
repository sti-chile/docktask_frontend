import { createHttpClient } from "../lib/httpClient"

export const useInvitacionesQuery = (token) => {
    const http = createHttpClient(token)

    const getPendientes = async () => {
        try {
            const data = await http.get("/api/v1/invitaciones/pendientes")
            return data
        } catch (e) {
            if (e.response?.status === 404) return []
            throw e
        }
    }

    const aceptar = async (invitacionId) => {
        const data = await http.post(`/api/v1/invitaciones/${invitacionId}/aceptar`)
        return data
    }

    const rechazar = async (invitacionId) => {
        const data = await http.post(`/api/v1/invitaciones/${invitacionId}/rechazar`)
        return data
    }

    const buscarUsuarios = async (q) => {
        const data = await http.get(`/api/v1/usuarios/buscar?q=${encodeURIComponent(q)}`)
        return data
    }

    const crearInvitacion = async (payload) => {
        const data = await http.post("/api/v1/invitaciones", payload)
        return data
    }

    const getMiembrosWorkspace = async (workspaceId) => {
        const data = await http.get(`/api/v1/workspaces/${workspaceId}/miembros`)
        return data
    }

    const eliminarMiembro = async (workspaceId, usuarioId) => {
        const data = await http.delete(`/api/v1/workspaces/${workspaceId}/miembros/${usuarioId}`)
        return data
    }

    return {
        getPendientes,
        aceptar,
        rechazar,
        buscarUsuarios,
        crearInvitacion,
        getMiembrosWorkspace,
        eliminarMiembro,
    }
}
