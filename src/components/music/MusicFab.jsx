import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * MusicFab - Floating Action Button para acceder al reproductor de música.
 * Aparece en todas las páginas (excepto las de música) como un botón discreto.
 * Al hacer clic, navega a la biblioteca de música.
 */
const MusicFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // No mostrar en páginas de música (ya están ahí)
  if (location.pathname.startsWith('/music')) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/music/library')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all duration-300 ease-in-out"
      style={{
        padding: isHovered ? '12px 20px' : '14px',
      }}
      title="Abrir reproductor de música"
      aria-label="Abrir reproductor de música"
    >
      {/* Icono de nota musical */}
      <svg 
        className="w-6 h-6" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
      
      {/* Texto que aparece al hacer hover */}
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isHovered ? 'max-w-32 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        Música
      </span>
    </button>
  );
};

export default MusicFab;
