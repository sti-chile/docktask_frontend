import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    PencilSquareIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    ClockIcon,
    ChatBubbleLeftIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EstadoSelect from "../EstadoSelect"
import ExpirationInfo from "../common/ExpirationInfo"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useComentariosQuery } from "../../hooks/useComentariosQuery"
import { useAuth } from "@/context/AuthContext"

// Componente interno para la sección de comentarios
const ComentariosSection = ({ tareaId, token }) => {
    const { comentarios, isLoading, crearComentario, eliminarComentario } = useComentariosQuery(
        token,
        tareaId
    )
    const [nuevoComentario, setNuevoComentario] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!nuevoComentario.trim()) return
        crearComentario.mutate({ contenido: nuevoComentario.trim() })
        setNuevoComentario("")
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        try {
            const d = new Date(dateString)
            return d.toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return ""
        }
    }

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
                <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-700">Comentarios ({comentarios.length})</h3>
            </div>

            {/* Lista de comentarios */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                {isLoading ? (
                    <p className="text-sm text-gray-400">Cargando comentarios...</p>
                ) : comentarios.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin comentarios aún</p>
                ) : (
                    comentarios.map((c) => (
                        <div key={c.id} className="flex gap-2 bg-gray-50 rounded-lg p-3">
                            <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                        {c.usuario_nombre || `Usuario #${c.usuario_id}`}
                                    </span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-xs text-gray-400">
                                            {formatDate(c.created_at)}
                                        </span>
                                        <button
                                            onClick={() => eliminarComentario.mutate(c.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                                    {c.contenido}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario nuevo comentario */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={!nuevoComentario.trim() || crearComentario.isPending}
                    className="flex items-center gap-1"
                >
                    <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}

const TaskCard = ({
    tarea,
    onEstadoChange,
    onDelete,
    onDuplicar,
    onFechaExpiracionChange,
    isDragging = false,
    currentDroppableId = null,
}) => {
    const navigate = useNavigate()
    const [localEstado, setLocalEstado] = useState(tarea.estado)
    const { token } = useAuth()

    const handleEstadoChange = (nuevoEstado) => {
        if (onEstadoChange) {
            onEstadoChange(tarea.id, nuevoEstado)
        }
    }

    const estadoActual = isDragging && currentDroppableId ? currentDroppableId : localEstado

    const formatDate = (dateString) => {
        if (!dateString) return "Fecha no disponible"
        try {
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
            return new Date(dateString).toLocaleDateString("es-ES", options)
        } catch {
            return "Fecha inválida"
        }
    }

    // --- Render ---
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card
                    className={`animate-fade-in transition-all duration-300 ${isDragging ? "opacity-50 cursor-grabbing" : "cursor-pointer hover:shadow-md"}`}
                >
                    <CardHeader className="pb-2 border-b flex flex-col sm:flex-row justify-between gap-2">
                        <CardTitle className="text-lg font-semibold break-words">
                            {tarea.nombre}
                        </CardTitle>
                        <div
                            className="min-w-0 w-full max-w-full sm:w-60"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <EstadoSelect
                                estado={estadoActual}
                                onChange={(nuevoEstado) => {
                                    setLocalEstado(nuevoEstado)
                                    handleEstadoChange(nuevoEstado)
                                }}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                            {tarea.descripcion || tarea.mensaje}
                        </p>

                        <div className="flex items-center text-sm text-gray-500 border-t pt-4 mb-4">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span>
                                Actualizado:{" "}
                                {formatDate(
                                    tarea.fecha_actualizacion || tarea.updated_at || tarea.fecha
                                )}
                            </span>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                            <ExpirationInfo
                                expirationDate={tarea.expiration_date}
                                onDateChange={(fecha) => {
                                    if (onFechaExpiracionChange && fecha != null) {
                                        onFechaExpiracionChange(tarea.id, fecha)
                                    }
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-6">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/edit/${tarea.id}`)
                                            }}
                                            className="h-9 w-9 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Editar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(tarea.id)
                                            }}
                                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Eliminar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDuplicar(tarea)
                                            }}
                                            className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                        >
                                            <DocumentDuplicateIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Duplicar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            {/* MODAL AMPLIADO */}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        {tarea.nombre}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-600">Estado</h3>
                            <p className="text-gray-900">{tarea.estado}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-600">Proyecto</h3>
                            <p className="text-gray-900">{tarea.proyecto_id || "—"}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-600">Fecha</h3>
                            <p className="text-gray-900">{formatDate(tarea.fecha)}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-600">Fecha Expiración</h3>
                            <p className="text-gray-900">{formatDate(tarea.expiration_date)}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-600 mb-2">Descripción completa</h3>
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {tarea.descripcion || tarea.mensaje}
                        </p>
                    </div>

                    {/* COMENTARIOS */}
                    <ComentariosSection tareaId={tarea.id} token={token} />

                    <div className="flex justify-end gap-4 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDuplicar(tarea)
                            }}
                            className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(tarea.id)
                            }}
                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/edit/${tarea.id}`)
                            }}
                            className="h-9 w-9 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                        >
                            <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TaskCard
