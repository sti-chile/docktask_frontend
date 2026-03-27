import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMensajesQuery } from '../hooks/useMensajesQuery';
import { useProjectQuery } from '../hooks/useProjectQuery';
import EstadoSelect from './EstadoSelect';

const CreateMessage = ({ token }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project_id');

  const { crearMensaje } = useMensajesQuery(token);
  const { proyectos } = useProjectQuery(token);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    mensaje: '',
    estado: 'pendiente',
    project_id: projectId || null,
    expiration_date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que los campos requeridos no estén vacíos
      if (!formData.nombre.trim() || !formData.mensaje.trim()) {
        toast.error('Por favor, complete todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Validar que la fecha de expiración sea futura
      if (formData.expiration_date) {
        const expirationDate = new Date(formData.expiration_date);
        const now = new Date();
        if (expirationDate <= now) {
          toast.error('La fecha de expiración debe ser futura');
          setLoading(false);
          return;
        }
      }

      await crearMensaje.mutateAsync(formData);
      navigate(projectId ? `/mis-mensajes?project_id=${projectId}` : '/mis-mensajes');
    } catch (error) {
      // El error ya se muestra en el hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {projectId ? 'Crear Mensaje para el Proyecto' : 'Crear Nuevo Mensaje'}
          </h1>
          <button
            onClick={() => navigate(projectId ? `/mis-mensajes?project_id=${projectId}` : '/mis-mensajes')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Nombre del mensaje */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Mensaje *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre del mensaje"
              />
            </div>

            {/* Cuerpo del mensaje */}
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido del Mensaje *
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el contenido del mensaje"
              />
            </div>

            {!projectId && (
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
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
                  {proyectos?.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Estado del mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <EstadoSelect
                estado={formData.estado}
                onChange={handleChange}
              />
            </div>

            {/* Fecha de expiración */}
            <div>
              <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(projectId ? `/mis-mensajes?project_id=${projectId}` : '/mis-mensajes')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creando...' : 'Crear Mensaje'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMessage; 