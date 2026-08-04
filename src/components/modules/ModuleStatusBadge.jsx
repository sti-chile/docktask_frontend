// ModuleStatusBadge — badge visual de estado del módulo
import React from "react"

const STATUS_STYLES = {
    planned: "bg-blue-100 text-blue-700 border-blue-200",
    "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
}

const STATUS_LABELS = {
    planned: "Planificado",
    "in-progress": "En progreso",
    completed: "Completado",
    cancelled: "Cancelado",
}

const ModuleStatusBadge = ({ status, className = "" }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.planned
    const label = STATUS_LABELS[status] || status

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
        >
            {label}
        </span>
    )
}

export { ModuleStatusBadge, STATUS_LABELS }
