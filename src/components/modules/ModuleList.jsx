// ModuleList — lista de módulos con barra de progreso y filtro por estado
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useModulesQuery } from "../../hooks/useModulesQuery"
import ModuleProgressBar from "./ModuleProgressBar"
import { ModuleStatusBadge } from "./ModuleStatusBadge"
import { PlusIcon, FunnelIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline"

const FILTERS = [
    { key: "", label: "Todos" },
    { key: "planned", label: "Planificados" },
    { key: "in-progress", label: "En progreso" },
    { key: "completed", label: "Completados" },
    { key: "cancelled", label: "Cancelados" },
]

const ModuleList = ({ token, workspaceId }) => {
    const navigate = useNavigate()
    const [filter, setFilter] = useState("")
    const [showCreate, setShowCreate] = useState(false)
    const [newName, setNewName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [newStartDate, setNewStartDate] = useState("")
    const [newTargetDate, setNewTargetDate] = useState("")

    const { modules, isLoading, crearModule, archivarModule, eliminarModule } = useModulesQuery(
        token,
        workspaceId,
        { status: filter }
    )

    const handleCreate = async () => {
        if (!newName.trim()) return
        const payload = { nombre: newName.trim() }
        if (newDesc.trim()) payload.descripcion = newDesc.trim()
        if (newStartDate) payload.start_date = newStartDate
        if (newTargetDate) payload.target_date = newTargetDate
        await crearModule.mutateAsync(payload)
        setNewName("")
        setNewDesc("")
        setNewStartDate("")
        setNewTargetDate("")
        setShowCreate(false)
    }

    const handleArchive = async (moduleId, nombre) => {
        if (!window.confirm(`¿Archivar el módulo "${nombre}"?`)) return
        await archivarModule.mutateAsync(moduleId)
    }

    const handleDelete = async (moduleId, nombre) => {
        if (!window.confirm(`¿Eliminar el módulo "${nombre}"? Esta acción no se puede deshacer.`))
            return
        await eliminarModule.mutateAsync(moduleId)
    }

    const formatDate = (d) => {
        if (!d) return "—"
        try {
            return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })
        } catch {
            return "—"
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">Módulos</h2>
                    <span className="text-sm text-gray-400">({modules.length})</span>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nuevo módulo
                </button>
            </div>

            {/* Create form inline */}
            {showCreate && (
                <div className="flex flex-col gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre del módulo (requerido)"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        autoFocus
                    />
                    <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-0.5 block">
                                Fecha inicio
                            </label>
                            <input
                                type="date"
                                value={newStartDate}
                                onChange={(e) => setNewStartDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-0.5 block">
                                Fecha objetivo
                            </label>
                            <input
                                type="date"
                                value={newTargetDate}
                                onChange={(e) => setNewTargetDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={!newName.trim()}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Crear
                        </button>
                        <button
                            onClick={() => {
                                setShowCreate(false)
                                setNewName("")
                                setNewDesc("")
                                setNewStartDate("")
                                setNewTargetDate("")
                            }}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 text-sm flex-wrap">
                <FunnelIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            filter === f.key
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
                    ))}
                </div>
            ) : modules.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-1">No hay módulos</p>
                    <p className="text-sm">Crea tu primer módulo para empezar</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                            onClick={() => navigate(`/workspace/${workspaceId}/modules/${m.id}`)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                            {m.nombre}
                                        </h3>
                                        <ModuleStatusBadge status={m.status} />
                                        {m.archived_at && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                                <ArchiveBoxIcon className="h-3 w-3" />
                                                Archivado
                                            </span>
                                        )}
                                    </div>
                                    {m.descripcion && (
                                        <p className="text-sm text-gray-500 line-clamp-1 mb-1">
                                            {m.descripcion}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {formatDate(m.start_date)} → {formatDate(m.target_date)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar + acciones */}
                            <div className="mt-3 flex items-center gap-3 flex-wrap">
                                <div className="flex-1 min-w-[100px]">
                                    <ModuleProgressBar
                                        completed={m.completed_tasks || 0}
                                        total={m.total_tasks || 0}
                                        size="sm"
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {!m.archived_at && (
                                        <button
                                            onClick={() => handleArchive(m.id, m.nombre)}
                                            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                                            title="Archivar módulo"
                                        >
                                            Archivar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(m.id, m.nombre)}
                                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                        title="Eliminar módulo"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ModuleList
