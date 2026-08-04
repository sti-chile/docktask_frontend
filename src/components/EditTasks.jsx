import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { createHttpClient, httpClient } from "@/lib/httpClient"
import LinkPreview from "./LinkPreview"
import { extractFirstUrl } from "../api/previewApi"

// La API devuelve ISO con segundos ("2026-08-04T10:30:00") pero un input
// datetime-local sólo acepta "YYYY-MM-DDTHH:mm": sin recortar, el campo se ve vacío.
const toInputValue = (iso) => (iso ? iso.slice(0, 16) : "")

function EditTask({ token }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [descripcion, setDescripcion] = useState("")
    const [nombre, setNombre] = useState("")
    const [startDate, setStartDate] = useState("")
    const [expirationDate, setExpirationDate] = useState("")
    const [previewUrl, setPreviewUrl] = useState(null)
    const debounceRef = useRef(null)

    // Detectar URLs con debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setPreviewUrl(extractFirstUrl(descripcion))
        }, 600)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [descripcion])

    useEffect(() => {
        const api = token ? createHttpClient(token) : httpClient
        api.get(`/api/v1/mis-tareas`)
            .then((data) => {
                const tarea = data.find((t) => t.id === parseInt(id))
                if (tarea) {
                    setNombre(tarea.nombre || "")
                    setDescripcion(tarea.descripcion || tarea.mensaje || "")
                    setStartDate(toInputValue(tarea.start_date))
                    setExpirationDate(toInputValue(tarea.expiration_date))
                }
            })
            .catch(() => {})
    }, [id, token])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (startDate && expirationDate && new Date(startDate) >= new Date(expirationDate)) {
            toast.error("La fecha de inicio debe ser anterior a la de expiración")
            return
        }

        // start_date acepta null para limpiarse; expiration_date NO: el backend le
        // aplica fromisoformat sin chequear vacío, así que si no hay valor la
        // omitimos del payload en vez de mandar "" y comerse un 400.
        const payload = { nombre, descripcion, start_date: startDate || null }
        if (expirationDate) payload.expiration_date = expirationDate

        const api = token ? createHttpClient(token) : httpClient
        api.put(`/api/v1/tareas/${id}`, payload)
            .then(() => navigate("/mis-tareas"))
            .catch((error) => {
                // Antes fallaba en silencio. Ahora que se pueden mandar fechas, un
                // 400 por formato tiene que ser visible o parece que no guardo nada.
                toast.error(error?.message || "No se pudo guardar la tarea")
            })
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Tarea</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la tarea"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="descripcion"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Edite la descripción de la tarea"
                    />
                    {previewUrl && <LinkPreview url={previewUrl} />}
                </div>
                {/* Ambas fechas son necesarias para que la tarea aparezca en el
                    Gantt: GanttBoard filtra por start_date && expiration_date. */}
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="start_date"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Fecha de Inicio
                        </label>
                        <input
                            type="datetime-local"
                            id="start_date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="expiration_date"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Fecha de Expiración
                        </label>
                        <input
                            type="datetime-local"
                            id="expiration_date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Guardar Cambios
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/mis-tareas")}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditTask
