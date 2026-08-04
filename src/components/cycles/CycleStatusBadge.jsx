// CycleStatusBadge — badge visual de estado del ciclo
import React from "react"

const STATUS_STYLES = {
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
}

const STATUS_LABELS = {
    draft: "Borrador",
    active: "Activo",
    completed: "Completado",
    cancelled: "Cancelado",
}

const CycleStatusBadge = ({ status, className = "" }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.draft
    const label = STATUS_LABELS[status] || status

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
        >
            {label}
        </span>
    )
}

export { CycleStatusBadge, STATUS_LABELS }
