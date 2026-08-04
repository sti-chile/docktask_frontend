import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { createHttpClient } from "../lib/httpClient"
import { useAuth } from "../context/AuthContext"
import { useGuestTareas } from "./useGuestStore"

export const useTareasQuery = (token, proyectoId = null) => {
    const { isGuest } = useAuth()
    const http = createHttpClient(token)
    const qc = useQueryClient()

    // ── Siempre se declaran todos los hooks ───────────────────────────────
    const guest = useGuestTareas(token, proyectoId, isGuest)

    const queryParams = proyectoId ? `?proyecto_id=${proyectoId}` : ""
    const {
        data: tareas = [],
        isLoading,
        error,
        refetch: cargarTareas,
    } = useQuery({
        queryKey: ["tareas", proyectoId],
        queryFn: async () => {
            const data = await http.get(`/api/v1/mis-tareas${queryParams}`)
            return Array.isArray(data) ? data : []
        },
        enabled: !!token && !isGuest,
    })

    const crearTarea = useMutation({
        mutationFn: async (nuevaTarea) => {
            if (isGuest) throw new Error("Los invitados no pueden crear tareas")
            const tareaData = {
                ...nuevaTarea,
                proyecto_id: nuevaTarea.project_id ? parseInt(nuevaTarea.project_id) : null,
            }
            delete tareaData.project_id
            return http.post("/api/v1/tareas", tareaData)
        },
        onSuccess: () => {
            qc.invalidateQueries(["tareas"])
            toast.success("Tarea creada correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para crear tareas."
                    : err.message || "Error al crear la tarea"
            ),
    })

    const cambiarEstado = useMutation({
        mutationFn: async ({ id, estado }) => {
            if (isGuest) throw new Error("Los invitados no pueden editar tareas")
            return http.put(`/api/v1/tareas/${id}`, { estado })
        },
        onSuccess: () => {
            qc.invalidateQueries(["tareas"])
            toast.success("Estado actualizado correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para editar tareas."
                    : err.message || "Error al actualizar el estado"
            ),
    })

    const eliminarTarea = useMutation({
        mutationFn: async (id) => {
            if (isGuest) throw new Error("Los invitados no pueden eliminar tareas")
            return http.delete(`/api/v1/tareas/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries(["tareas"])
            toast.success("Tarea eliminada correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para eliminar tareas."
                    : err.message || "Error al eliminar la tarea"
            ),
    })

    const duplicarTarea = useMutation({
        mutationFn: async (id) => {
            if (isGuest) throw new Error("Los invitados no pueden duplicar tareas")
            return http.post(`/api/v1/mis-tareas/${id}/duplicate`)
        },
        onSuccess: () => {
            qc.invalidateQueries(["tareas"])
            toast.success("Tarea duplicada correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para duplicar tareas."
                    : err.message || "Error al duplicar la tarea"
            ),
    })

    const actualizarFechaExpiracion = useMutation({
        mutationFn: async ({ id, expiration_date }) => {
            if (isGuest) throw new Error("Los invitados no pueden modificar tareas")
            if (!expiration_date) throw new Error("La fecha de expiración es requerida")
            const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
            if (!dateRegex.test(expiration_date))
                throw new Error("Formato de fecha inválido. Debe ser YYYY-MM-DDTHH:mm")
            return http.put(`/api/v1/tareas/${id}`, { expiration_date })
        },
        onSuccess: () => {
            qc.invalidateQueries(["tareas"])
            toast.success("Fecha de expiración actualizada correctamente")
        },
        onError: (err) =>
            toast.error(
                isGuest
                    ? "Crea una cuenta gratis para editar tareas."
                    : err.message || "Error al actualizar la fecha de expiración"
            ),
    })

    // ── Guest: datos desde guest store ──
    if (isGuest) {
        return {
            tareas: guest.tareas,
            loading: guest.isLoading,
            isLoading: guest.isLoading,
            error: guest.error,
            cargarTareas,
            crearTarea,
            cambiarEstado,
            eliminarTarea,
            duplicarTarea,
            actualizarFechaExpiracion,
        }
    }

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
        actualizarFechaExpiracion,
    }
}
