import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ChatBubbleLeftIcon, ArrowRightOnRectangleIcon, UserGroupIcon, ClipboardDocumentIcon, RectangleGroupIcon } from '@heroicons/react/24/outline/index.js';

const Navbar = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200">
              <HomeIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Inicio</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to="/mis-mensajes"
                  className="flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200 ver-mensajes-btn"
                >
                  <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Mis Mensajes</span>
                </Link>
                <Link
                  to="/mis-proyectos"
                  className="flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200 ver-proyectos-btn"
                >
                  <ClipboardDocumentIcon className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Mis Proyectos</span>
                </Link>
                <Link
                  to="/mis-workspaces"
                  className="flex items-center text-gray-800 hover:text-indigo-600 transition-colors duration-200"
                >
                  <RectangleGroupIcon className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Workspaces</span>
                </Link>

                {user.rol === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center text-gray-800 hover:text-purple-600 transition-colors duration-200"
                  >
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    <span className="font-semibold">Admin Panel</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    navigate('/');
                  }}
                  className="flex items-center text-gray-800 hover:text-red-600 transition-colors duration-200 cerrar-sesion-btn"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                <span className="font-semibold">Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 