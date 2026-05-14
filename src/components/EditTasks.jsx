import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createHttpClient, httpClient } from '@/lib/httpClient';
import LinkPreview from './LinkPreview';
import { extractFirstUrl } from '../api/previewApi';

function EditTask({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState("");
  const [nombre, setNombre] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const debounceRef = useRef(null);

  // Detectar URLs con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewUrl(extractFirstUrl(descripcion));
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [descripcion]);

  useEffect(() => {
    const api = token ? createHttpClient(token) : httpClient;
    api
      .get(`/api/v1/mis-tareas`)
      .then((data) => {
        const tarea = data.find((t) => t.id === parseInt(id));
        if (tarea) {
          setNombre(tarea.nombre || "");
          setDescripcion(tarea.descripcion || tarea.mensaje || "");
        }
      })
      .catch(() => {});
  }, [id, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const api = token ? createHttpClient(token) : httpClient;
    api
      .put(
        `/api/v1/tareas/${id}`,
        {
          nombre,
          descripcion,
        }
      )
      .then(() => navigate("/mis-tareas"))
      .catch(() => {});
  };

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
          <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
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
  );
}

export default EditTask;
