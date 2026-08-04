import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { apiModules } from "../api/modulesApi"

export const useModulesQuery = (token, workspaceId, { moduleId, status } = {}) => {
    const modules_api = apiModules(token)
    const qc = useQueryClient()

    // ── List ────────────────────────────────────────────────────────────────
    const {
        data: modules = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["modules", workspaceId, status],
        queryFn: async () => {
            try {
                const params = status ? { status } : {}
                const data = await modules_api.list(workspaceId, params)
                return Array.isArray(data) ? data : []
            } catch (err) {
                console.error("Error al cargar módulos:", err)
                toast.error("Error al cargar los módulos")
                return []
            }
        },
        enabled: !!token && !!workspaceId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Single ───────────────────────────────────────────────────────────────
    const { data: module = null, isLoading: isModuleLoading } = useQuery({
        queryKey: ["module", workspaceId, moduleId],
        queryFn: async () => {
            try {
                const data = await modules_api.get(workspaceId, moduleId)
                return data || null
            } catch (err) {
                console.error("Error al cargar módulo:", err)
                toast.error("Error al cargar el módulo")
                return null
            }
        },
        enabled: !!token && !!workspaceId && !!moduleId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Module tasks ─────────────────────────────────────────────────────────
    const { data: moduleTasks = [], isLoading: isModuleTasksLoading } = useQuery({
        queryKey: ["moduleTasks", workspaceId, moduleId],
        queryFn: async () => {
            try {
                const data = await modules_api.getTasks(workspaceId, moduleId)
                return Array.isArray(data) ? data : data?.tasks || []
            } catch (err) {
                console.error("Error al cargar tareas del módulo:", err)
                toast.error("Error al cargar las tareas del módulo")
                return []
            }
        },
        enabled: !!token && !!workspaceId && !!moduleId,
        retry: 1,
        staleTime: 30000,
        cacheTime: 60000,
    })

    // ── Mutations ────────────────────────────────────────────────────────────
    const crearModule = useMutation({
        mutationFn: async (payload) => modules_api.create(workspaceId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["modules"] })
            toast.success("Módulo creado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al crear el módulo"),
    })

    const actualizarModule = useMutation({
        mutationFn: async ({ moduleId: id, ...payload }) =>
            modules_api.update(workspaceId, id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["modules"] })
            qc.invalidateQueries({ queryKey: ["module", workspaceId, moduleId] })
            toast.success("Módulo actualizado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al actualizar el módulo"),
    })

    const eliminarModule = useMutation({
        mutationFn: async (id) => modules_api.delete(workspaceId, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["modules"] })
            toast.success("Módulo eliminado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al eliminar el módulo"),
    })

    const archivarModule = useMutation({
        mutationFn: async (id) => modules_api.archive(workspaceId, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["modules"] })
            toast.success("Módulo archivado correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al archivar el módulo"),
    })

    const asignarTarea = useMutation({
        mutationFn: async ({ taskId, moduleId: mId }) => modules_api.assignTask(taskId, mId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["module", workspaceId, moduleId] })
            qc.invalidateQueries({ queryKey: ["moduleTasks", workspaceId, moduleId] })
            toast.success("Tarea asignada al módulo correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al asignar la tarea"),
    })

    const removerTarea = useMutation({
        mutationFn: async ({ taskId, moduleId: mId }) => modules_api.removeTask(taskId, mId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["module", workspaceId, moduleId] })
            qc.invalidateQueries({ queryKey: ["moduleTasks", workspaceId, moduleId] })
            toast.success("Tarea removida del módulo correctamente")
        },
        onError: (err) => toast.error(err.message || "Error al remover la tarea"),
    })

    return {
        modules,
        isLoading,
        error,
        module,
        isModuleLoading,
        moduleTasks,
        isModuleTasksLoading,
        crearModule,
        actualizarModule,
        eliminarModule,
        archivarModule,
        asignarTarea,
        removerTarea,
    }
}
