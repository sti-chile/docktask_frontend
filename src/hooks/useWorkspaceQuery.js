import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { createHttpClient } from "../lib/httpClient"
import { useAuth } from "../context/AuthContext"
import { useGuestWorkspace } from "./useGuestStore"

export const useWorkspaceQuery = (token) => {
    const { isGuest } = useAuth()
    const http = createHttpClient(token)
    const qc = useQueryClient()

    // ── Siempre se declaran todos los hooks ───────────────────────────────
    const guest = useGuestWorkspace(token, isGuest)

    const {
        data: workspaces = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            try {
                const data = await http.get("/api/v1/workspaces/")
                return data || []
            } catch (err) {
                console.error("Error al cargar workspaces:", err)
                toast.error("Error al cargar los workspaces")
                return []
            }
        },
        enabled: !!token && !isGuest,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    const crearWorkspace = useMutation({
        mutationFn: async (datos) => {
            if (isGuest) throw new Error("Los invitados no pueden crear workspaces")
            return http.post("/api/v1/workspaces/", datos)
        },
        onSuccess: () => {
            qc.invalidateQueries(["workspaces"])
            toast.success("Workspace creado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para crear espacios."
                    : err.message || "Error al crear el workspace"
            ),
    })

    const actualizarWorkspace = useMutation({
        mutationFn: async ({ id, ...datos }) => {
            if (isGuest) throw new Error("Los invitados no pueden modificar workspaces")
            return http.put(`/api/v1/workspaces/${id}`, datos)
        },
        onSuccess: () => {
            qc.invalidateQueries(["workspaces"])
            toast.success("Workspace actualizado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para editar espacios."
                    : err.message || "Error al actualizar el workspace"
            ),
    })

    const eliminarWorkspace = useMutation({
        mutationFn: async (id) => {
            if (isGuest) throw new Error("Los invitados no pueden eliminar workspaces")
            return http.delete(`/api/v1/workspaces/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries(["workspaces"])
            toast.success("Workspace eliminado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para eliminar espacios."
                    : err.message || "Error al eliminar el workspace"
            ),
    })

    // ── Guest: datos desde guest store ──
    if (isGuest) {
        return {
            workspaces: guest.workspaces,
            isLoading: guest.isLoading,
            error: guest.error,
            crearWorkspace,
            actualizarWorkspace,
            eliminarWorkspace,
        }
    }

    return {
        workspaces,
        isLoading,
        error,
        crearWorkspace,
        actualizarWorkspace,
        eliminarWorkspace,
    }
}
