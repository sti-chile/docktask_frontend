import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  RectangleGroupIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline/index.js';
import { useTauri } from '../hooks/useTauri';
import { useAuth } from '@/context/AuthContext';
import InvitacionesBell from './InvitacionesBell';
import NotificacionesBell from './NotificacionesBell';

// ─────────────────────────────────────────────
//  LINKS DE NAVEGACIÓN
// ─────────────────────────────────────────────

const NAV_LINKS = (user) => [
  { to: '/', label: 'Inicio', icon: HomeIcon, className: '' },
  { to: '/mis-mensajes', label: 'Mensajes', icon: ChatBubbleLeftIcon, className: 'ver-mensajes-btn' },
  { to: '/mis-proyectos', label: 'Proyectos', icon: ClipboardDocumentIcon, className: 'ver-proyectos-btn' },
  { to: '/mis-workspaces', label: 'Workspaces', icon: RectangleGroupIcon, className: '' },
  ...(user?.rol === 'admin'
    ? [{ to: '/admin', label: 'Admin', icon: UserGroupIcon, className: '' }]
    : []),
];

// ─────────────────────────────────────────────
//  NAVBAR PRINCIPAL
// ─────────────────────────────────────────────

const Navbar = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useTauri();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user } = useAuth();
  const links = NAV_LINKS(user);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setMenuOpen(false);
  };

  // ── Navegación inferior para mobile (Android) ──
  if (isMobile && token) {
    return <MobileBottomNav links={links} onLogout={handleLogout} location={location} />;
  }

  // ── Navbar horizontal para desktop y web ──
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Home */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              <HomeIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">DockTask</span>
            </Link>
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                {links.slice(1).map(({ to, label, icon: Icon, className }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center text-gray-800 hover:text-blue-600 transition-colors duration-200 ${className}`}
                  >
                    <Icon className="h-5 w-5 mr-1.5" />
                    <span className="font-semibold">{label}</span>
                  </Link>
                ))}
                <InvitacionesBell token={token} />
                <NotificacionesBell />
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-800 hover:text-red-600 transition-colors duration-200 cerrar-sesion-btn"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                  <span className="font-semibold">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="font-semibold text-gray-800 hover:text-blue-600">
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Hamburger para tablet/mobile web */}
          {token && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              >
                {menuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menú desplegable mobile web */}
      {menuOpen && token && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-2">
          {links.map(({ to, label, icon: Icon, className }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 ${className}`}
            >
              <Icon className="h-5 w-5 mr-3 text-gray-500" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 cerrar-sesion-btn"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
};

// ─────────────────────────────────────────────
//  BOTTOM NAV (solo Tauri Android)
// ─────────────────────────────────────────────

const MobileBottomNav = ({ links, onLogout, location }) => {
  // Mostrar máximo 4 links + logout en bottom nav
  const visibleLinks = links.slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-16 safe-area-pb">
      {visibleLinks.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/' && location.pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center flex-1 h-full pt-1 transition-colors duration-150 ${
              isActive
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] mt-0.5 font-medium">{label}</span>
          </Link>
        );
      })}

      {/* Botón logout */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center justify-center flex-1 h-full pt-1 text-gray-500 hover:text-red-500 transition-colors duration-150"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
        <span className="text-[10px] mt-0.5 font-medium">Salir</span>
      </button>
    </nav>
  );
};

export default Navbar;
