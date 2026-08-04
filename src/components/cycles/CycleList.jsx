// CycleList — lista de ciclos con barra de progreso y filtro por estado
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCyclesQuery } from "../../hooks/useCyclesQuery"
import CycleProgressBar from "./CycleProgressBar"
import { CycleStatusBadge } from "./CycleStatusBadge"
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline"

const FILTERS = [
    { key: "", label: "Todos" },
    { key: "active", label: "Activos" },
    { key: "draft", label: "Borradores" },
    { key: "completed", label: "Completados" },
]

const CycleList = ({ token, workspaceId }) => {
    const navigate = useNavigate()
    const [filter, setFilter] = useState("")
    const [showCreate, setShowCreate] = useState(false)
    const [newName, setNewName] = useState("")

    const { cycles, isLoading, crearCycle, eliminarCycle, activarCycle, completarCycle } =
        useCyclesQuery(token, workspaceId, { status: filter })

    const handleCreate = async () => {
        if (!newName.trim()) return
        await crearCycle.mutateAsync({ nombre: newName.trim() })
        setNewName("")
        setShowCreate(false)
    }

    const handleActivate = async (cycleId) => {
        await activarCycle.mutateAsync(cycleId)
    }

    const handleComplete = async (cycleId) => {
        await completarCycle.mutateAsync(cycleId)
    }

    const handleDelete = async (cycleId, name) => {
        if (!window.confirm(`¿Eliminar el ciclo "${name}"?`)) return
        await eliminarCycle.mutateAsync(cycleId)
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
                    <h2 className="text-xl font-bold text-gray-800">Ciclos / Sprints</h2>
                    <span className="text-sm text-gray-400">({cycles.length})</span>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nuevo ciclo
                </button>
            </div>

            {/* Create form inline */}
            {showCreate && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre del ciclo (ej: Sprint 2)"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        autoFocus
                    />
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
                        }}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancelar
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 text-sm">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
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
            ) : cycles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-1">No hay ciclos</p>
                    <p className="text-sm">Crea tu primer ciclo para empezar</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {cycles.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                            onClick={() => navigate(`/workspace/${workspaceId}/cycles/${c.id}`)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                            {c.nombre}
                                        </h3>
                                        <CycleStatusBadge status={c.status} />
                                    </div>
                                    {c.descripcion && (
                                        <p className="text-sm text-gray-500 line-clamp-1 mb-1">
                                            {c.descripcion}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {formatDate(c.start_date)} → {formatDate(c.end_date)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar + acciones */}
                            <div className="mt-3 flex items-center gap-3 flex-wrap">
                                <div className="flex-1 min-w-[100px]">
                                    <CycleProgressBar
                                        completed={c.completed_tasks || 0}
                                        total={c.total_tasks || 0}
                                        size="sm"
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {c.status === "draft" && (
                                        <button
                                            onClick={() => handleActivate(c.id)}
                                            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                                            title="Activar ciclo"
                                        >
                                            Activar
                                        </button>
                                    )}
                                    {c.status === "active" && (
                                        <button
                                            onClick={() => handleComplete(c.id)}
                                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                                            title="Completar ciclo"
                                        >
                                            Completar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(c.id, c.nombre)}
                                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                        title="Eliminar ciclo"
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

export default CycleList
