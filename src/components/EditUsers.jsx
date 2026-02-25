import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { UserPlusIcon, UserIcon, LockClosedIcon, IdentificationIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline/index.js';
import { buildAxios } from '../api/axiosInstance';

function EditUsers({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'usuario'
  });

  useEffect(() => {
    if (id) {
      obtenerUsuario(id);
    } else {
      obtenerUsuarios();
    }
  }, [id]);

  const obtenerUsuarios = async () => {
    setLoading(true);
    try {
      const axios = buildAxios(token);
      const res = await axios.get("/admin/api/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setError("Error al obtener usuarios");
      console.error(err);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const obtenerUsuario = async (userId) => {
    setLoading(true);
    try {
      const axios = buildAxios(token);
      const res = await axios.get(`/admin/api/usuarios/${userId}`);
      setEditingUser(res.data);
    } catch (err) {
      setError("Error al obtener usuario");
      console.error(err);
      toast.error('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const axios = buildAxios(token);
      await axios.post('/admin/api/usuarios', newUser);
      
      toast.success('Usuario creado exitosamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setNewUser({
        username: '',
        password: '',
        nombre: '',
        apellido: '',
        rol: 'usuario'
      });

      obtenerUsuarios();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear el usuario. Verifica los datos e intenta nuevamente.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const axios = buildAxios(token);
      await axios.put(`/admin/api/usuarios/${id}`, editingUser);
      
      toast.success('Usuario actualizado exitosamente');
      navigate('/admin');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario. Verifica los datos e intenta nuevamente.');
    }
  };

  const eliminarUsuario = async (userId) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }
    try {
      setLoading(true);
      const axios = buildAxios(token);
      await axios.delete(`/admin/api/usuarios/${userId}`);
      
      toast.success('Usuario eliminado exitosamente');
      obtenerUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error('Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  // Si estamos editando un usuario
  if (id && editingUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Editar Usuario</h3>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={editingUser.username}
                  onChange={handleInputChange}
                  placeholder="Nombre de usuario"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={editingUser.password || ''}
                  onChange={handleInputChange}
                  placeholder="Nueva contraseña (opcional)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={editingUser.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="apellido"
                  value={editingUser.apellido}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <select
                  name="rol"
                  value={editingUser.rol}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <PencilIcon className="h-5 w-5" />
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Vista principal con lista de usuarios y formulario de creación
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Formulario de nuevo usuario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                placeholder="Nombre de usuario"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="nombre"
                value={newUser.nombre}
                onChange={handleInputChange}
                placeholder="Nombre"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="apellido"
                value={newUser.apellido}
                onChange={handleInputChange}
                placeholder="Apellido"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                name="rol"
                value={newUser.rol}
                onChange={handleInputChange}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Crear Usuario
          </button>
        </form>
      </div>

      {/* Lista de usuarios existentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Usuarios Existentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.apellido}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/admin/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => eliminarUsuario(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EditUsers;
