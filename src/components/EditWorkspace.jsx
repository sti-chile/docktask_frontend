import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspaceQuery } from '../hooks/useWorkspaceQuery';
import InvitarMiembros from './InvitarMiembros';

const EditWorkspace = ({ token }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspaces, actualizarWorkspace } = useWorkspaceQuery(token);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ws = workspaces.find((w) => String(w.id) === String(id));
    if (ws) {
      setFormData({
        nombre: ws.nombre || '',
        descripcion: ws.descripcion || '',
        is_shared: ws.is_shared || false,
        estado: ws.estado || 'activo',
      });
    }
  }, [workspaces, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actualizarWorkspace.mutateAsync({ id: Number(id), ...formData });
      navigate('/mis-workspaces');
    } catch (error) {
      console.error('Error al actualizar el workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-500">
        Cargando workspace...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Editar Workspace</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Workspace
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>

          <InvitarMiembros workspaceId={Number(id)} token={token} />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/mis-workspaces')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkspace;
