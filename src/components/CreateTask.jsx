import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useTareasQuery } from "../hooks/useTareasQuery";
import { useProjectQuery } from "../hooks/useProjectQuery";
import EstadoSelect from "./EstadoSelect";
import LinkPreview from "./LinkPreview";
import { extractFirstUrl } from "../api/previewApi";
import TaskToolbar from "./ui/TaskToolbar";

const CreateTask = ({ token }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get("project_id");

  const { crearTarea } = useTareasQuery(token);
  const { proyectos } = useProjectQuery(token);

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const debounceRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectEmoji = (emoji) => {
    setFormData((prev) => ({
      ...prev,
      descripcion: `${prev.descripcion || ""}${emoji}`,
    }));
  };

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "pendiente",
    project_id: projectId || null,
    expiration_date: "",
  });

  // Detectar URLs en el campo descripcion con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = extractFirstUrl(formData.descripcion);
      setPreviewUrl(url);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.descripcion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nombre.trim() || !formData.descripcion.trim()) {
        toast.error("Por favor, complete todos los campos requeridos");
        setLoading(false);
        return;
      }

      if (formData.expiration_date) {
        const expirationDate = new Date(formData.expiration_date);
        const now = new Date();
        if (expirationDate <= now) {
          toast.error("La fecha de expiración debe ser futura");
          setLoading(false);
          return;
        }
      }

      await crearTarea.mutateAsync(formData);
      navigate(
        projectId ? `/mis-tareas?project_id=${projectId}` : "/mis-tareas",
      );
    } catch (error) {
      // Error ya se muestra en el hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {projectId ? "Crear Tarea para el Proyecto" : "Crear Nueva Tarea"}
          </h1>
          <button
            onClick={() =>
              navigate(
                projectId
                  ? `/mis-tareas?project_id=${projectId}`
                  : "/mis-tareas",
              )
            }
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Volver
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <div className="space-y-6">
            {/* Nombre de la tarea */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Tarea *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre de la tarea"
              />
            </div>
            {/* Descripción */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                onFocus={() => setIsEditing(true)}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese la descripción de la tarea (puede incluir enlaces)"
              />
              {isEditing && <TaskToolbar onSelectEmoji={handleSelectEmoji} />}
              {previewUrl && <LinkPreview url={previewUrl} token={token} />}
            </div>
            {!projectId && (
              <div>
                <label
                  htmlFor="project_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Proyecto
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un proyecto</option>
                  {proyectos?.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <EstadoSelect estado={formData.estado} onChange={handleChange} />
            </div>
            {/* Fecha de expiración */}
            <div>
              <label
                htmlFor="expiration_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Expiración
              </label>
              <input
                type="datetime-local"
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    projectId
                      ? `/mis-tareas?project_id=${projectId}`
                      : "/mis-tareas",
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creando..." : "Crear Tarea"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
