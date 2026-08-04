/**
 * useGuestStore.js — Cache de datos demo para modo invitado.
 *
 * Cuando el usuario es guest, los hooks normales (useProjectQuery, useTareasQuery,
 * useWorkspaceQuery) fallan porque el backend filtra por usuario_id real.
 *
 * Esta store carga UNA VEZ el payload de GET /api/v1/guest/demo-data y lo sirve
 * como datos planos en cache local (react-query), emulando los endpoints reales.
 */

import { useQuery } from "@tanstack/react-query"
import { createHttpClient } from "../lib/httpClient"

/**
 * Carga y cachea el demo-data completo del guest.
 * Retorna workspace, proyectos y tareas en un solo objeto.
 */
export const useGuestDemoData = (token, enabled = false) => {
    return useQuery({
        queryKey: ["guest-demo-data"],
        queryFn: async () => {
            const http = createHttpClient(token)
            const data = await http.get("/api/v1/guest/demo-data")

            // Normalizar
            const workspace = data.workspace || data
            const proyectos = data.proyectos || data.projects || []
            const tareas = data.tareas || data.tasks || []

            // Indexar tareas por proyecto_id
            const tareasPorProyecto = {}
            for (const t of tareas) {
                const pid = t.proyecto_id ?? t.project_id
                if (!tareasPorProyecto[pid]) tareasPorProyecto[pid] = []
                tareasPorProyecto[pid].push(t)
            }

            return { workspace, proyectos, tareas, tareasPorProyecto }
        },
        enabled: !!token && enabled,
        staleTime: 24 * 60 * 60 * 1000, // 24h — el token expira igual
        cacheTime: 24 * 60 * 60 * 1000,
        retry: 1,
    })
}

/**
 * Hook para que useProjectQuery consuma datos guest.
 * Se conecta a useGuestDemoData y devuelve solo proyectos.
 */
export const useGuestProyectos = (token, enabled = false) => {
    const { data, isLoading, error } = useGuestDemoData(token, enabled)
    return {
        proyectos: data?.proyectos ?? [],
        isLoading,
        error,
    }
}

/**
 * Hook para que useTareasQuery consuma datos guest, filtrado por proyecto_id.
 */
export const useGuestTareas = (token, proyectoId = null, enabled = false) => {
    const { data, isLoading, error } = useGuestDemoData(token, enabled)

    let tareas = data?.tareas ?? []
    if (proyectoId) {
        tareas = tareas.filter((t) => (t.proyecto_id ?? t.project_id) === parseInt(proyectoId))
    }

    return {
        tareas,
        isLoading,
        error,
    }
}

/**
 * Hook para que useWorkspaceQuery consuma datos guest.
 */
export const useGuestWorkspace = (token, enabled = false) => {
    const { data, isLoading, error } = useGuestDemoData(token, enabled)
    return {
        workspaces: data?.workspace ? [data.workspace] : [],
        isLoading,
        error,
    }
}
