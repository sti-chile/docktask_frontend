import React from "react"
import { PlusIcon } from "@heroicons/react/24/outline/index.js"
import TaskCardContainer from "../containers/TaskCardContainer"

const TasksBoardView = ({
    tareas = [],
    isLoading,
    error,
    onDelete,
    onEdit,
    onEstadoChange,
    onDuplicar,
    onFechaExpiracionChange,
    onCreateClick,
    onRetry,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}) => {
    const estados = ["urgente", "pendiente", "en_progreso", "completado", "archivado"]
    const getEstadoTitulo = (estado) => {
        switch (estado) {
            case "urgente":
                return "Urgente"
            case "pendiente":
                return "Pendiente"
            case "en_progreso":
                return "En Progreso"
            case "completado":
                return "Completado"
            case "archivado":
                return "Archivado"
            default:
                return estado
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 text-lg mb-4">Error al cargar las tareas</p>
                <button
                    onClick={onRetry}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Mis Tareas</h1>
                <button
                    onClick={onCreateClick}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Tarea
                </button>
            </div>

            {!tareas || tareas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg mb-4">No tienes tareas creadas</p>
                    <button
                        onClick={onCreateClick}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200"
                    >
                        Crear mi primera tarea
                    </button>
                </div>
            ) : (
                <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {estados.map((estado) => (
                        <div
                            key={estado}
                            className="w-full max-w-full bg-gray-50 rounded-lg p-4"
                            onDragOver={(e) => onDragOver(e, estado)}
                            onDrop={(e) => onDrop(e, estado)}
                        >
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                {getEstadoTitulo(estado)}
                            </h2>
                            <div className="space-y-4">
                                {tareas
                                    .filter((tarea) => tarea.estado === estado)
                                    .map((tarea) => (
                                        <div
                                            key={tarea.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, tarea)}
                                            onDragEnd={onDragEnd}
                                        >
                                            <TaskCardContainer
                                                tarea={tarea}
                                                onDelete={onDelete}
                                                onEdit={onEdit}
                                                onEstadoChange={onEstadoChange}
                                                onDuplicar={onDuplicar}
                                                onFechaExpiracionChange={onFechaExpiracionChange}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TasksBoardView
