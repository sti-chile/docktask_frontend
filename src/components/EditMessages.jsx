import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { buildAxios } from '../api/axiosInstance';

function EditMessage({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const axios = buildAxios(token);
    axios
      .get(`/api/mis-mensajes`)
      .then((res) => {
        const msg = res.data.find((m) => m.id === parseInt(id));
        if (msg) setMensaje(msg.mensaje);
      })
      .catch((err) => console.error("Error al cargar mensaje", err));
  }, [id, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const axios = buildAxios(token);
    axios
      .put(
        `/api/mensajes/${id}`,
        {
          mensaje,
        }
      )
      .then(() => navigate("/mis-mensajes"))
      .catch((err) => console.error("Error al actualizar", err));
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
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
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
