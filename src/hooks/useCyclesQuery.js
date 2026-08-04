import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { createHttpClient } from "../lib/httpClient"
import { apiCycles } from "../api/cyclesApi"

export const useCyclesQuery = (token, workspaceId, { cycleId, status } = {}) => {
    const http = createHttpClient(token)
    const cycles_api = apiCycles(token)
    const qc = useQueryClient()

    // ── List ────────────────────────────────────────────────────────────────
    const {
        data: cycles = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["cycles", workspaceId, status],
        queryFn: async () => {
            try {
                const params = status ? { status } : {}
                const data = await cycles_api.list(workspaceId, params)
                return Array.isArray(data) ? data : []
            } catch (err) {
                console.error("Error al cargar ciclos:", err)
                toast.error("Error al cargar los ciclos")
                return []
            }
        },
        enabled: !!token && !!workspaceId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Single ───────────────────────────────────────────────────────────────
    const { data: cycle = null, isLoading: isCycleLoading } = useQuery({
        queryKey: ["cycle", workspaceId, cycleId],
        queryFn: async () => {
            try {
                const data = await cycles_api.get(workspaceId, cycleId)
                return data || null
            } catch (err) {
                console.error("Error al cargar ciclo:", err)
                toast.error("Error al cargar el ciclo")
                return null
            }
        },
        enabled: !!token && !!workspaceId && !!cycleId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Cycle tasks ──────────────────────────────────────────────────────────
    const { data: cycleTasks = [], isLoading: isCycleTasksLoading } = useQuery({
        queryKey: ["cycleTasks", workspaceId, cycleId],
        queryFn: async () => {
            try {
                const data = await http.get(
                    `/api/v1/workspaces/${workspaceId}/tasks?cycle_id=${cycleId}`
                )
                return Array.isArray(data) ? data : data?.tasks || []
            } catch (err) {
                console.error("Error al cargar tareas del ciclo:", err)
                toast.error("Error al cargar las tareas del ciclo")
                return []
            }
        },
        enabled: !!token && !!workspaceId && !!cycleId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Mutations ────────────────────────────────────────────────────────────
    const crearCycle = useMutation({
        mutationFn: async (payload) => cycles_api.create(workspaceId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycles"] })
            toast.success("Ciclo creado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al crear el ciclo"),
    })

    const actualizarCycle = useMutation({
        mutationFn: async ({ cycleId: id, ...payload }) =>
            cycles_api.update(workspaceId, id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycles"] })
            qc.invalidateQueries({ queryKey: ["cycle", workspaceId, cycleId] })
            toast.success("Ciclo actualizado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al actualizar el ciclo"),
    })

    const eliminarCycle = useMutation({
        mutationFn: async (id) => cycles_api.delete(workspaceId, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycles"] })
            toast.success("Ciclo eliminado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al eliminar el ciclo"),
    })

    const activarCycle = useMutation({
        mutationFn: async (id) => cycles_api.activate(workspaceId, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycles"] })
            qc.invalidateQueries({ queryKey: ["cycle", workspaceId, cycleId] })
            toast.success("Ciclo activado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al activar el ciclo"),
    })

    const completarCycle = useMutation({
        mutationFn: async (id) => cycles_api.complete(workspaceId, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycles"] })
            qc.invalidateQueries({ queryKey: ["cycle", workspaceId, cycleId] })
            toast.success("Ciclo completado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al completar el ciclo"),
    })

    const asignarTarea = useMutation({
        mutationFn: async ({ taskId, cycleId: cId }) => cycles_api.assignTask(taskId, cId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycle", workspaceId, cycleId] })
            qc.invalidateQueries({ queryKey: ["cycleTasks", workspaceId, cycleId] })
            toast.success("Tarea asignada al ciclo correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al asignar la tarea"),
    })

    const removerTarea = useMutation({
        mutationFn: async (taskId) => cycles_api.removeTask(taskId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cycle", workspaceId, cycleId] })
            qc.invalidateQueries({ queryKey: ["cycleTasks", workspaceId, cycleId] })
            toast.success("Tarea removida del ciclo correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al remover la tarea"),
    })

    return {
        cycles,
        isLoading,
        error,
        cycle,
        isCycleLoading,
        cycleTasks,
        isCycleTasksLoading,
        crearCycle,
        actualizarCycle,
        eliminarCycle,
        activarCycle,
        completarCycle,
        asignarTarea,
        removerTarea,
    }
}
