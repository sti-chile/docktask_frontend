// CycleSelector — dropdown reutilizable para seleccionar ciclo de una tarea
import React, { useState, useEffect } from "react"
import { apiCycles } from "../../api/cyclesApi"

const CycleSelector = ({
    token,
    workspaceId,
    value, // cycle_id actual (o null)
    onChange, // (cycleId | null) => void
    disabled = false,
    className = "",
}) => {
    const [cycles, setCycles] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!token || !workspaceId) return
        setLoading(true)
        apiCycles(token)
            .list(workspaceId)
            .then(setCycles)
            .catch(() => setCycles([]))
            .finally(() => setLoading(false))
    }, [token, workspaceId])

    const handleChange = (e) => {
        const val = e.target.value
        onChange(val === "" ? null : parseInt(val))
    }

    // Orden: activos primero, luego draft, luego completados
    const sorted = [...cycles].sort((a, b) => {
        const order = { active: 0, draft: 1, completed: 2, cancelled: 3 }
        return (order[a.status] ?? 99) - (order[b.status] ?? 99)
    })

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo / Sprint</label>
            <select
                value={value ?? ""}
                onChange={handleChange}
                disabled={disabled || loading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${value ? "border-blue-300" : ""}`}
            >
                <option value="">Sin ciclo</option>
                {sorted.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre} —{" "}
                        {c.status === "active"
                            ? "🟢 Activo"
                            : c.status === "draft"
                              ? "📝 Borrador"
                              : c.status === "completed"
                                ? "✅ Completado"
                                : "❌ Cancelado"}
                    </option>
                ))}
                {!loading && cycles.length === 0 && (
                    <option disabled>No hay ciclos disponibles</option>
                )}
            </select>
        </div>
    )
}

export default CycleSelector
