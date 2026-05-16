import React, { useState, useEffect, useRef } from 'react';
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline/index.js';
import { XMarkIcon } from '@heroicons/react/24/solid/index.js';
import { useNotificacionesQuery } from '../hooks/useNotificacionesQuery';

const TIPO_CONFIG = {
  tarea_editada:    { icon: PencilSquareIcon,              color: 'text-blue-500',   bg: 'bg-blue-50' },
  vencimiento:      { icon: ClockIcon,                     color: 'text-orange-500', bg: 'bg-orange-50' },
  tarea_comentada:  { icon: ChatBubbleLeftEllipsisIcon,    color: 'text-green-500',  bg: 'bg-green-50' },
  default:          { icon: InformationCircleIcon,         color: 'text-gray-400',   bg: 'bg-gray-50' },
};

const tipoConfig = (tipo) => TIPO_CONFIG[tipo] || TIPO_CONFIG.default;

const NotificacionesBell = ({ token }) => {
  const api = useNotificacionesQuery(token);
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; });

  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const cargar = async () => {
    if (!token) return;
    try {
      const data = await apiRef.current.getNotificaciones({ limit: 20 });
      setNotificaciones(data?.notificaciones ?? []);
      setNoLeidas(data?.total_no_leidas ?? 0);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarcarLeida = async (id, e) => {
    e.stopPropagation();
    try {
      await apiRef.current.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarcarTodas = async () => {
    try {
      await apiRef.current.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {}
  };

  const formatTiempo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h}h`;
    return `Hace ${Math.floor(h / 24)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <BellIcon className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[420px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <h3 className="font-semibold text-gray-800 text-sm">
              Notificaciones {noLeidas > 0 && <span className="text-indigo-600">({noLeidas})</span>}
            </h3>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <CheckIcon className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Sin notificaciones
              </div>
            )}

            {notificaciones.map((n) => {
              const { icon: Icon, color, bg } = tipoConfig(n.tipo);
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors ${
                    n.leida ? 'bg-white' : 'bg-indigo-50/40'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.leida ? 'text-gray-600' : 'text-gray-900'}`}>
                      {n.titulo}
                    </p>
                    {n.mensaje && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">{formatTiempo(n.created_at)}</p>
                  </div>

                  {!n.leida && (
                    <button
                      onClick={(e) => handleMarcarLeida(n.id, e)}
                      className="flex-shrink-0 text-gray-300 hover:text-indigo-500 transition-colors mt-0.5"
                      title="Marcar como leída"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesBell;
