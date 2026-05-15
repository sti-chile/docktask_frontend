import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon, BellAlertIcon } from '@heroicons/react/24/outline/index.js';
import { useNotificaciones } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const ICONO_TIPO = {
  vencimiento: '⏰',
  edicion: '✏️',
  inactividad: '💤',
  comentario: '💬',
  invitacion: '📨',
};

const COLOR_BORDE_TIPO = {
  vencimiento: 'border-l-orange-400',
  edicion: 'border-l-blue-400',
  inactividad: 'border-l-gray-400',
  comentario: 'border-l-green-400',
  invitacion: 'border-l-purple-400',
};

const NotificacionesBell = () => {
  const [open, setOpen] = useState(false);
  const {
    notificaciones,
    noLeidas,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones();

  useEffect(() => {
    if (open) {
      cargarNotificaciones();
    }
  }, [open, cargarNotificaciones]);

  const handleMarcarLeida = useCallback(async (e, id) => {
    e.stopPropagation();
    await marcarLeida(id);
  }, [marcarLeida]);

  const handleMarcarTodas = useCallback(async (e) => {
    e.stopPropagation();
    await marcarTodasLeidas();
  }, [marcarTodasLeidas]);

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        {noLeidas > 0 ? (
          <BellAlertIcon className="h-5 w-5 text-amber-500" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">
                Notificaciones
              </h3>
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodas}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            {/* Lista */}
            {notificaciones.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Sin notificaciones
              </div>
            )}

            {notificaciones.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                  n.leida ? 'border-l-transparent' : COLOR_BORDE_TIPO[n.tipo] || 'border-l-blue-400'
                } ${!n.leida ? 'bg-blue-50/30' : ''}`}
                onClick={() => !n.leida && marcarLeida(n.id)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {ICONO_TIPO[n.tipo] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {n.titulo}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.mensaje}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.leida && (
                    <button
                      onClick={(e) => handleMarcarLeida(e, n.id)}
                      className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                      title="Marcar como leída"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesBell;
