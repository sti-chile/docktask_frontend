/**
 * NotificationContext — WebSocket + estado de notificaciones en tiempo real.
 *
 * Flujo:
 * 1. Al montar con token, conecta Socket.IO al backend
 * 2. Escucha eventos: notificacion:nueva, notificaciones:conteo
 * 3. Expone: lista de notificaciones, conteo no leídas, acciones (marcar leída, etc.)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.docktask.com';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  // Conectar/desconectar WebSocket según el token
  useEffect(() => {
    mountedRef.current = true;

    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotificaciones([]);
      setNoLeidas(0);
      return;
    }

    const socket = io(API_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // La conexión se autentica del lado del servidor
    });

    socket.on('notificacion:nueva', (notif) => {
      if (!mountedRef.current) return;
      setNotificaciones((prev) => [notif, ...prev].slice(0, 100));
      setNoLeidas((prev) => prev + 1);
    });

    socket.on('notificaciones:conteo', (data) => {
      if (!mountedRef.current) return;
      if (data && typeof data.no_leidas === 'number') {
        setNoLeidas(data.no_leidas);
      }
    });

    socket.on('disconnect', () => {
      // Reconexión automática activada
    });

    socket.on('connect_error', () => {
      // Silencioso — el badge de no leídas no se actualiza hasta reconectar
    });

    socketRef.current = socket;

    return () => {
      mountedRef.current = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  /**
   * Recargar notificaciones desde REST (usado al abrir el dropdown)
   */
  const cargarNotificaciones = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
        setNoLeidas(data.total_no_leidas || 0);
      }
    } catch {
      // Silencioso
    }
  }, [token]);

  /**
   * Marcar una notificación como leída
   */
  const marcarLeida = useCallback(async (id) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/v1/notificaciones/${id}/leida`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {
      // Silencioso
    }
  }, [token]);

  /**
   * Marcar todas como leídas
   */
  const marcarTodasLeidas = useCallback(async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/v1/notificaciones/leer-todas`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leida: true }))
      );
      setNoLeidas(0);
    } catch {
      // Silencioso
    }
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        noLeidas,
        cargarNotificaciones,
        marcarLeida,
        marcarTodasLeidas,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificaciones = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de <NotificationProvider>');
  return ctx;
};
