import React, { useState, useEffect } from 'react';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { buildAxios } from '../api/axiosInstance';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Limpiar campos al montar el componente
  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  // Efecto para animar la torta
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);

    try {
      const axios = buildAxios();
      const response = await axios.post('/api/login', {
        username,
        password
      });

      const { access_token: token, usuario: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('Respuesta del servidor inválida');
      }

      // Crear objeto de usuario
      const user = {
        username: userData.username,
        rol: userData.rol,
        id: userData.id,
        nombre: userData.nombre,
        apellido: userData.apellido
      };
      
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Notificar éxito
      toast.success('¡Login exitoso!');

      // Limpiar formulario
      setUsername('');
      setPassword('');

      // Notificar al componente padre
      if (onLogin) {
        onLogin(token, user);
      }

      // Redirigir según el rol
      const redirectPath = user.rol === 'admin' ? '/admin' : '/mis-mensajes';
      navigate(redirectPath);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login fallido. Revisa tus credenciales.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    //DIV contenedor principal del login form
    <div className="flex justify-center items-center h-screen min-h-[calc(100vh-4rem)]">
      {isLoading && (
        //DIV contenedor del loading
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Círculo base */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${progress * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-100 ease-linear"
                  style={{ transition: 'stroke-dashoffset 0.3s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-500">{progress}%</span>
              </div>
            </div>
            <p className="text-gray-600">Iniciando sesión...</p>
          </div>
        </div>
      )}

      {/* Formulario de login */}
      <div className="w-full max-w-md"> {/* Wrapper para centrar y limitar ancho */}
      <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-6">

        <div className="space-y-4">
          {/* Input de usuario */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={username}
              placeholder="Usuario"
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="username"
            />
          </div>

          {/* Input de contraseña */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="current-password"
            />
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LockClosedIcon className="h-5 w-5" />
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>

        {/* Texto de registro */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200">
              Crear Cuenta
            </Link>
          </p>
        </div>
      </form>
      </div> {/* Fin del wrapper */}
    </div>
  );
};

export default LoginForm;
