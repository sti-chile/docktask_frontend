import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MusicalNoteIcon } from '@heroicons/react/24/outline/index.js';

/**
 * MusicFab - Floating Action Button estilo Winamp/Audius para acceder al reproductor de música.
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
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-music-card border-2 border-music-border rounded-full shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/30 hover:border-primary"
      style={{
        padding: isHovered ? '12px 24px' : '14px',
      }}
      title="Abrir reproductor de música"
      aria-label="Abrir reproductor de música"
    >
      {/* Icono de nota musical outline */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <MusicalNoteIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        {/* Anillo de actividad */}
        <div className={`absolute -inset-1 border-2 border-primary/30 rounded-full animate-ping ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      
      {/* Texto que aparece al hacer hover */}
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-medium ${
          isHovered ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        DockTask Music
      </span>
      
      {/* Indicador de reproducción (si hay música en curso) */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full ${isHovered ? 'animate-pulse' : ''}`}></div>
    </button>
  );
};

export default MusicFab;
