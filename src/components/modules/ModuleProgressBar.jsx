// ModuleProgressBar — visual de progreso de módulo
import React from "react"

const ModuleProgressBar = ({ completed, total, size = "md" }) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0

    const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }
    const heightsClass = heights[size] || heights.md

    const getColor = () => {
        if (pct === 100) return "bg-emerald-500"
        if (pct >= 75) return "bg-blue-500"
        if (pct >= 50) return "bg-amber-500"
        return "bg-gray-400"
    }

    return (
        <div className="w-full">
            <div className={`w-full bg-gray-200 rounded-full ${heightsClass}`}>
                <div
                    className={`${heightsClass} rounded-full transition-all duration-500 ${getColor()}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {size !== "sm" && (
                <p className="text-xs text-gray-500 mt-1">
                    {completed}/{total} tareas · {pct}%
                </p>
            )}
        </div>
    )
}

export default ModuleProgressBar
