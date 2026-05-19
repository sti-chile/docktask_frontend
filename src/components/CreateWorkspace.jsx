import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceQuery } from '../hooks/useWorkspaceQuery';
import EmojiPicker from 'emoji-picker-react';

const CreateWorkspace = ({ token }) => {
  const navigate = useNavigate();
  const { crearWorkspace } = useWorkspaceQuery(token);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: null,
    is_shared: false,
  });
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Cerrar picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      await crearWorkspace.mutateAsync(formData);
      navigate('/mis-workspaces');
    } catch (error) {
      console.error('Error al crear el workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Crear Nuevo Workspace</h1>

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
              placeholder="Ej: Desarrollo Frontend"
            />
          </div>

          <div>
            <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-1">
              Icono (emoji)
            </label>
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {formData.icono ? (
                  <span className="text-2xl">{formData.icono}</span>
                ) : (
                  <span className="text-gray-400">Seleccionar emoji</span>
                )}
              </button>
              {formData.icono && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, icono: null }));
                  }}
                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              )}
              {showEmojiPicker && (
                <div className="absolute z-50 mt-1">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setFormData((prev) => ({ ...prev, icono: emojiData.emoji }));
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
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
              placeholder="Describe el propósito de este workspace"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_shared"
              name="is_shared"
              checked={formData.is_shared}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_shared" className="text-sm font-medium text-gray-700">
              Compartir con otros usuarios
            </label>
          </div>

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
              {loading ? 'Creando...' : 'Crear Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
