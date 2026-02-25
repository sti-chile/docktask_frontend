import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ token, children }) => {
  const idleTimeoutRef = useRef(null);
  const idleTime = 30 * 60 * 1000; // 30 minutos de inactividad

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        // Redirigir al login cuando la sesión expire
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/login`;
      }, idleTime);
    };

    // Eventos que resetean el timer de inactividad
    const events = ['mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Iniciar el timer inicialmente
    resetIdleTimer();

    // Limpiar el timer cuando el componente se desmonte
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;