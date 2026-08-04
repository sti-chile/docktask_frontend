import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { createHttpClient } from "../lib/httpClient"
import { jwtDecode } from "jwt-decode"
import { useAuth } from "../context/AuthContext"
import { useGuestProyectos } from "./useGuestStore"

export const useProjectQuery = (token, workspaceId = null) => {
    const { isGuest } = useAuth()
    const http = createHttpClient(token)
    const qc = useQueryClient()

    // ── Siempre se declaran todos los hooks (regla de react-hooks) ────────
    const guest = useGuestProyectos(token, isGuest)

    const queryParams = workspaceId ? `?workspace_id=${workspaceId}` : ""
    const {
        data: proyectos = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["proyectos", workspaceId],
        queryFn: async () => {
            try {
                const proyectosResp = await http.get(`/api/v1/proyectos${queryParams}`)
                if (workspaceId) return proyectosResp || []
                const user = jwtDecode(token)
                const owner_id = user.sub
                return (proyectosResp || []).filter((p) => String(p.owner_id) === String(owner_id))
            } catch (err) {
                console.error("Error al cargar proyectos:", err)
                toast.error("Error al cargar los proyectos")
                return []
            }
        },
        enabled: !!token && !isGuest,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    const crearProyecto = useMutation({
        mutationFn: async (nuevoProyecto) => {
            if (isGuest) throw new Error("Los invitados no pueden crear proyectos")
            return http.post("/api/v1/proyectos", nuevoProyecto)
        },
        onSuccess: () => {
            qc.invalidateQueries(["proyectos"])
            toast.success("Proyecto creado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para crear proyectos."
                    : err.message || "Error al crear el proyecto"
            ),
    })

    const actualizarProyecto = useMutation({
        mutationFn: async ({ id, ...datos }) => {
            if (isGuest) throw new Error("Los invitados no pueden modificar proyectos")
            return http.put(`/api/v1/proyectos/${id}`, datos)
        },
        onSuccess: () => {
            qc.invalidateQueries(["proyectos"])
            toast.success("Proyecto actualizado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para editar proyectos."
                    : err.message || "Error al actualizar el proyecto"
            ),
    })

    const eliminarProyecto = useMutation({
        mutationFn: async (id) => {
            if (isGuest) throw new Error("Los invitados no pueden eliminar proyectos")
            return http.delete(`/api/v1/proyectos/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries(["proyectos"])
            toast.success("Proyecto eliminado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para eliminar proyectos."
                    : err.message || "Error al eliminar el proyecto"
            ),
    })

    // ── Retornar datos según rol ──────────────────────────────────────────
    if (isGuest) {
        return {
            proyectos: guest.proyectos,
            isLoading: guest.isLoading,
            error: guest.error,
            crearProyecto,
            actualizarProyecto,
            eliminarProyecto,
        }
    }

    return {
        proyectos,
        isLoading,
        error,
        crearProyecto,
        actualizarProyecto,
        eliminarProyecto,
    }
}
