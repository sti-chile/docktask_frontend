import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createHttpClient, httpClient } from '@/lib/httpClient';

function EditMessage({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const api = token ? createHttpClient(token) : httpClient;
    api
      .get(`/api/mis-mensajes`)
      .then((data) => {
        const msg = data.find((m) => m.id === parseInt(id));
        if (msg) setMensaje(msg.mensaje);
      })
      .catch(() => {});
  }, [id, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const api = token ? createHttpClient(token) : httpClient;
    api
      .put(
        `/api/mensajes/${id}`,
        {
          mensaje,
        }
      )
      .then(() => navigate("/mis-mensajes"))
      .catch(() => {});
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Mensaje</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="mensaje" className="block text-gray-700 text-sm font-bold mb-2">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            onClick={() => navigate("/mis-mensajes")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMessage;
