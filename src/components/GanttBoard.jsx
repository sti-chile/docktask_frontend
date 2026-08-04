// src/components/GanttBoard.jsx
import React, { useEffect, useState, useRef } from "react"
import { Gantt } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createHttpClient } from "@/lib/httpClient"
import { Download } from "lucide-react"
import { exportToXlsx, exportToCsv, exportToPdf } from "@/lib/exportGantt"

const GanttBoard = ({ proyectoId, tareas: propsTareas, mensajes: propsMensajes, token }) => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [exportOpen, setExportOpen] = useState(false)
    const exportRef = useRef(null)

    useEffect(() => {
        // Modo embedido: recibe tareas directamente
        const source = propsTareas || propsMensajes
        if (source) {
            // Filtro defensivo por proyecto: si quien nos invoca conoce el
            // proyecto, no confiamos en que ya haya filtrado. Sin esto, un
            // contenedor sin contexto mezclaba tareas de varios proyectos en el
            // mismo diagrama y no habia nada que lo delatara.
            const delProyecto = proyectoId
                ? source.filter((m) => String(m.proyecto_id) === String(proyectoId))
                : source
            const tareasValidas = delProyecto
                .filter((m) => m.start_date && m.expiration_date)
                .map((m) => ({
                    id: String(m.id),
                    name: m.nombre,
                    start: new Date(m.start_date),
                    end: new Date(m.expiration_date),
                    type: "task",
                    progress: m.estado === "completado" ? 100 : m.estado === "en_progreso" ? 50 : 0,
                    isDisabled: false,
                    dependencies: [],
                }))
            if (tareasValidas.length === 0) {
                setError("No hay tareas con fechas asignadas para mostrar en el Gantt.")
            } else {
                setTasks(tareasValidas)
            }
            setLoading(false)
            return
        }

        // Modo standalone: carga tareas del proyecto
        if (!proyectoId) {
            setError("No se especificó un proyecto.")
            setLoading(false)
            return
        }

        const controller = new AbortController()
        const api = createHttpClient(token)

        api.get(`/api/v1/proyectos/${proyectoId}/tareas`, { signal: controller.signal })
            .then((tareas) => {
                const tareasValidas = tareas
                    .filter((m) => m.start_date && m.expiration_date)
                    .map((m) => ({
                        id: String(m.id),
                        name: m.nombre,
                        start: new Date(m.start_date),
                        end: new Date(m.expiration_date),
                        type: "task",
                        progress:
                            m.estado === "completado" ? 100 : m.estado === "en_progreso" ? 50 : 0,
                        isDisabled: false,
                        dependencies: [],
                    }))
                if (tareasValidas.length === 0) {
                    setError("No hay tareas con fechas asignadas.")
                } else {
                    setTasks(tareasValidas)
                }
                setLoading(false)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError("Error al cargar las tareas para el Gantt.")
                    setLoading(false)
                }
            })

        return () => controller.abort()
    }, [proyectoId, propsTareas, propsMensajes, token])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setExportOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="animate-pulse bg-gray-200 h-6 w-48 rounded"></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="bg-gray-200 h-4 w-full rounded"></div>
                        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                        <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-gray-500">{error}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-400 text-sm">
                        Asigna fechas de inicio y expiración a tus tareas para visualizarlas en el
                        diagrama de Gantt.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Diagrama de Gantt</CardTitle>
                {tasks.length > 0 && (
                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportOpen((o) => !o)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        {exportOpen && (
                            <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                                <button
                                    onClick={() => {
                                        exportToXlsx(tasks)
                                        setExportOpen(false)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Excel (.xlsx)
                                </button>
                                <button
                                    onClick={() => {
                                        exportToCsv(tasks)
                                        setExportOpen(false)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={() => {
                                        exportToPdf(tasks)
                                        setExportOpen(false)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    PDF
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Gantt tasks={tasks} />
            </CardContent>
        </Card>
    )
}

export default GanttBoard
