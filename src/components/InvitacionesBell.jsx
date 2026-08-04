import React, { useState, useEffect, useRef } from "react"
import {
    InboxIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserGroupIcon,
    FolderIcon,
} from "@heroicons/react/24/outline/index.js"
import { useInvitacionesQuery } from "../hooks/useInvitacionesQuery"

const InvitacionesBell = ({ token }) => {
    const [open, setOpen] = useState(false)
    const [invitaciones, setInvitaciones] = useState([])
    const [loading, setLoading] = useState(false)
    const [mensaje, setMensaje] = useState(null)
    const api = useInvitacionesQuery(token)
    const apiRef = useRef(api)
    useEffect(() => {
        apiRef.current = api
    })

    useEffect(() => {
        if (!token) return
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await apiRef.current.getPendientes()
                setInvitaciones(Array.isArray(data) ? data : [])
            } catch {
                setInvitaciones([])
            } finally {
                setLoading(false)
            }
        }
        cargar()
        const interval = setInterval(cargar, 30000)
        return () => clearInterval(interval)
    }, [token])

    const recargar = async () => {
        try {
            const data = await apiRef.current.getPendientes()
            setInvitaciones(Array.isArray(data) ? data : [])
        } catch {}
    }

    const handleAceptar = async (id) => {
        try {
            await apiRef.current.aceptar(id)
            setMensaje({ tipo: "exito", texto: "Invitación aceptada" })
            recargar()
        } catch {
            setMensaje({ tipo: "error", texto: "Error al aceptar invitación" })
        }
        setTimeout(() => setMensaje(null), 3000)
    }

    const handleRechazar = async (id) => {
        try {
            await apiRef.current.rechazar(id)
            setMensaje({ tipo: "info", texto: "Invitación rechazada" })
            recargar()
        } catch {
            setMensaje({ tipo: "error", texto: "Error al rechazar invitación" })
        }
        setTimeout(() => setMensaje(null), 3000)
    }

    const pendientes = invitaciones.filter((i) => i.estado === "pendiente")
    const count = pendientes.length

    return (
        <div className="relative">
            {/* Bell */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                title="Invitaciones"
            >
                <InboxIcon className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-full mt-1 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800 text-sm">
                                Invitaciones {count > 0 && `(${count})`}
                            </h3>
                        </div>

                        {mensaje && (
                            <div
                                className={`px-4 py-2 text-sm ${
                                    mensaje.tipo === "exito"
                                        ? "bg-green-50 text-green-700"
                                        : mensaje.tipo === "info"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-red-50 text-red-700"
                                }`}
                            >
                                {mensaje.texto}
                            </div>
                        )}

                        {loading && invitaciones.length === 0 && (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                Cargando...
                            </div>
                        )}

                        {!loading && invitaciones.length === 0 && (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                Sin invitaciones pendientes
                            </div>
                        )}

                        {invitaciones.map((inv) => (
                            <div
                                key={inv.id}
                                className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5">
                                        {inv.tipo === "workspace" ? (
                                            <UserGroupIcon className="h-4 w-4 text-blue-500" />
                                        ) : (
                                            <FolderIcon className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800">
                                            {inv.tipo === "workspace"
                                                ? `Workspace: ${inv.workspace_nombre}`
                                                : `Proyecto: ${inv.proyecto_nombre}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            De: {inv.sender_username}
                                        </p>
                                        {inv.mensaje && (
                                            <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">
                                                "{inv.mensaje}"
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(inv.created_at).toLocaleDateString("es-CL", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => handleAceptar(inv.id)}
                                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                            title="Aceptar"
                                        >
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleRechazar(inv.id)}
                                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                            title="Rechazar"
                                        >
                                            <XCircleIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default InvitacionesBell
