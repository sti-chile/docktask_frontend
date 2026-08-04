import React, { useState } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline/index.js"
import { useTareasQuery } from "../../hooks/useTareasQuery"
import Swal from "sweetalert2"
import TasksBoardView from "../views/TasksBoardView"
import CalendarView from "../../views/CalendarView"
import PillTabs from "../shared/PillTabs"
import GanttBoard from "../GanttBoard"

const VIEWS = [
    { value: "board", label: "Board", icon: Squares2X2Icon },
    { value: "tasks", label: "Tasks", icon: ClipboardDocumentListIcon },
    { value: "calendar", label: "Calendario", icon: CalendarDaysIcon },
    { value: "gantt", label: "Gantt", icon: ChartBarIcon },
]

const VALID_VIEWS = VIEWS.map((v) => v.value)

const TasksContainer = ({ token, proyectoId: proyectoIdProp = null }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { id: proyectoIdRuta } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()

    // El proyecto se resuelve en cascada: prop → path (/mis-proyectos/:id/...) →
    // query (?proyecto_id=). Antes sólo existía la prop, así que la ruta
    // /mis-tareas mostraba las tareas de TODOS los proyectos y el Gantt las mezclaba.
    const proyectoId = proyectoIdProp ?? proyectoIdRuta ?? searchParams.get("proyecto_id")

    // La vista vive en la URL, no en useState: así se comparte por link, sobrevive
    // un refresh y "volver atrás" te devuelve a la vista donde estabas.
    const viewParam = searchParams.get("view")
    const activeView = VALID_VIEWS.includes(viewParam) ? viewParam : "board"

    const setActiveView = (view) => {
        const next = new URLSearchParams(searchParams)
        if (view === "board") next.delete("view")
        else next.set("view", view)
        setSearchParams(next, { replace: true })
    }

    const {
        tareas = [],
        isLoading,
        error,
        eliminarTarea,
        cambiarEstado,
        duplicarTarea,
        actualizarFechaExpiracion,
    } = useTareasQuery(token, proyectoId)
    const [draggedTarea, setDraggedTarea] = useState(null)
    const [currentDroppableId, setCurrentDroppableId] = useState(null)

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la tarea de forma permanente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        })
        if (result.isConfirmed) {
            eliminarTarea.mutate(id)
        }
    }

    const handleEdit = (tarea) => {
        // Llevamos de dónde venimos para que al guardar o cancelar vuelva acá,
        // con el proyecto y la vista intactos, en vez de caer en /mis-tareas.
        navigate(`/edit/${tarea.id}`, {
            state: { from: `${location.pathname}${location.search}` },
        })
    }

    const handleEstadoChange = (id, nuevoEstado) => {
        cambiarEstado.mutate({ id, estado: nuevoEstado })
    }

    const handleDuplicar = (tarea) => {
        duplicarTarea.mutate(tarea.id)
    }

    const handleFechaExpiracionChange = (id, fecha) => {
        if (!id || !fecha) return
        actualizarFechaExpiracion.mutate({ id, expiration_date: fecha })
    }

    const handleCreateClick = () => {
        navigate(proyectoId ? `/create?proyecto_id=${proyectoId}` : "/create", {
            state: { from: `${location.pathname}${location.search}` },
        })
    }

    const handleRetry = () => {
        window.location.reload()
    }

    const handleDragStart = (e, tarea) => {
        setDraggedTarea(tarea)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", tarea.id)
    }

    const handleDragEnd = () => {
        setDraggedTarea(null)
        setCurrentDroppableId(null)
    }

    const handleDragOver = (e, estado) => {
        e.preventDefault()
        setCurrentDroppableId(estado)
    }

    const handleDrop = (e, estado) => {
        e.preventDefault()
        if (draggedTarea && draggedTarea.estado !== estado) {
            cambiarEstado.mutate({ id: draggedTarea.id, estado })
        }
        setDraggedTarea(null)
        setCurrentDroppableId(null)
    }

    return (
        <div>
            <PillTabs
                tabs={VIEWS}
                value={activeView}
                onChange={setActiveView}
                size="md"
                className="mb-6 w-fit"
            />
            {activeView === "board" && (
                <TasksBoardView
                    tareas={tareas}
                    isLoading={isLoading}
                    error={error}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onEstadoChange={handleEstadoChange}
                    onDuplicar={handleDuplicar}
                    onFechaExpiracionChange={handleFechaExpiracionChange}
                    onCreateClick={handleCreateClick}
                    onRetry={handleRetry}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
            )}
            {activeView === "tasks" && (
                <div className="text-center text-gray-500 py-20 text-xl">
                    Próximamente: vista de tareas
                </div>
            )}
            {activeView === "calendar" && <CalendarView tareas={tareas} />}
            {activeView === "gantt" && (
                <GanttBoard tareas={tareas} proyectoId={proyectoId} token={token} />
            )}
        </div>
    )
}

export default TasksContainer
