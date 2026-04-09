import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpClient } from '../../lib/httpClient';
import { useTauri } from '../../hooks/useTauri';

const MusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { isMobile } = useTauri();

  // Cargar playlist inicial (ejemplo)
  useEffect(() => {
    fetchPlaylist();
  }, []);

  const fetchPlaylist = async () => {
    try {
      const data = await httpClient.get('/api/v1/music/tracks');
      if (data && data.length > 0) {
        setPlaylist(data);
        if (!currentTrack) {
          setCurrentTrack(data[0]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error cargando tracks:', error);
      toast.error('No se pudieron cargar las pistas');
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error('Error al reproducir:', e);
        toast.error('No se pudo reproducir el audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    // El efecto de abajo manejará el cambio de src
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIndex]);
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cuando cambia currentTrack, obtener stream URL y actualizar audio src
  useEffect(() => {
    if (!currentTrack) return;
    const fetchStreamUrl = async () => {
      try {
        const data = await httpClient.get(`/api/v1/music/tracks/${currentTrack.id}/stream`);
        const { stream_url } = data;
        if (audioRef.current) {
          audioRef.current.src = stream_url;
          if (isPlaying) {
            audioRef.current.play().catch(e => console.error('Play error:', e));
          }
        }
      } catch (error) {
        console.error('Error obteniendo stream URL:', error);
        toast.error('No se pudo cargar el audio');
      }
    };
    fetchStreamUrl();
  }, [currentTrack]);

  return (
    <div className={`bg-music-bg text-music-text rounded-xl border-2 border-music-border shadow-2xl p-6 ${isMobile ? 'mb-20' : ''}`}>
      {/* Encabezado con logo tipo Winamp */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">DT</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DockTask Music</h1>
            <p className="text-sm text-gray-400">Estilo Audius × Winamp</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">VOLUME</div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Portada y info */}
        <div className="lg:col-span-1">
          <div className="bg-music-card border border-music-border rounded-xl p-4">
            {/* Portada con efecto bisel */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-gray-900 to-black rounded-lg border-2 border-gray-800 overflow-hidden shadow-inner">
              {currentTrack ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl">♪</span>
                    <p className="mt-4 text-lg font-semibold">{currentTrack.title}</p>
                    <p className="text-sm text-gray-400">{currentTrack.artist}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl text-gray-700">♫</span>
                </div>
              )}
              {/* Efecto de reflexión inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Metadatos */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duración:</span>
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tamaño:</span>
                <span className="font-mono">{currentTrack?.file_size ? `${(currentTrack.file_size / (1024*1024)).toFixed(1)} MB` : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Formato:</span>
                <span className="font-mono uppercase">{currentTrack?.mime_type?.split('/')[1] || 'MP3'}</span>
              </div>
            </div>

            {/* Visualizador de onda (placeholder) */}
            <div className="mt-8">
              <div className="text-xs text-gray-400 mb-2">VISUALIZADOR DE ONDA</div>
              <div className="h-20 bg-black rounded-lg border border-gray-800 p-2">
                <div className="flex items-end justify-between h-full">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-primary to-secondary rounded-t"
                      style={{
                        height: `${Math.sin(i * 0.5 + Date.now() / 300) * 30 + 40}%`,
                        transition: 'height 0.1s',
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna central y derecha: Controles y playlist */}
        <div className="lg:col-span-2 space-y-8">
          {/* Barra de progreso estilo Winamp */}
          <div className="bg-music-card border border-music-border rounded-xl p-6">
            <div className="mb-2 flex justify-between text-sm text-gray-400">
              <span>TIEMPO</span>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-3 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300"
            />
          </div>

          {/* Controles de reproducción estilo botones físicos */}
          <div className="bg-music-card border border-music-border rounded-xl p-6">
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={handlePrev}
                className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-primary transition-all duration-200 shadow-lg hover:shadow-primary/30"
                title="Anterior"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button
                onClick={handlePlayPause}
                className="p-6 rounded-full bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-4 border-gray-800 shadow-2xl hover:scale-105 transition-all duration-300"
                title={isPlaying ? 'Pausa' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-primary transition-all duration-200 shadow-lg hover:shadow-primary/30"
                title="Siguiente"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
            <div className="mt-8 flex justify-center space-x-6">
              <button
                onClick={() => navigate('/music/library')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" />
                </svg>
                <span>Biblioteca</span>
              </button>
              <button
                onClick={() => navigate('/music/upload')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border border-transparent rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm3-10.17L14.17 8H13v6h-2V8H9.83L12 5.83zM5 18h14v2H5z" />
                </svg>
                <span>Subir canción</span>
              </button>
            </div>
          </div>

          {/* Playlist rápida */}
          <div className="bg-music-card border border-music-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
              LISTA DE REPRODUCCIÓN
            </h3>
            <div className="max-h-60 overflow-y-auto">
              {playlist.length > 0 ? (
                <ul className="space-y-2">
                  {playlist.map((track, idx) => (
                    <li
                      key={track.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${currentIndex === idx ? 'bg-primary/20 border-primary' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                      onClick={() => {
                        setCurrentTrack(track);
                        setCurrentIndex(idx);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentIndex === idx ? 'bg-primary' : 'bg-gray-700'}`}>
                            {currentIndex === idx && isPlaying ? (
                              <span className="text-xs">♪</span>
                            ) : (
                              <span className="text-xs">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium truncate">{track.title}</div>
                            <div className="text-sm text-gray-400">{track.artist || 'Desconocido'}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{formatTime(track.duration_seconds)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No hay pistas en la playlist. Sube alguna canción.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
      />

      {/* Footer con información técnica */}
      <div className="mt-8 pt-6 border-t border-music-border text-xs text-gray-500 flex justify-between">
        <div>
          DockTask Music v1.0 • {currentTrack ? `Reproduciendo: ${currentTrack.title}` : 'En pausa'}
        </div>
        <div className="font-mono">
          {isPlaying ? '▶ REPRODUCIENDO' : '⏸ PAUSADO'} • BITRATE: 320kbps
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
