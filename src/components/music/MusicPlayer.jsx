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
    <div className={`bg-white rounded-lg shadow-lg p-4 ${isMobile ? 'mb-20' : ''}`}>
      {/* Reproductor principal */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Portada (placeholder) */}
        <div className="w-24 h-24 bg-gradient-to-br from-primary/70 to-primary rounded-lg flex items-center justify-center">
          <span className="text-white text-4xl">♪</span>
        </div>

        {/* Controles y info */}
        <div className="flex-1 w-full">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            {currentTrack?.title || 'Selecciona una canción'}
          </h3>
          <p className="text-gray-600">
            {currentTrack?.artist || 'Artista desconocido'}
          </p>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full hover:bg-gray-200"
                title="Anterior"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                title={isPlaying ? 'Pausa' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full hover:bg-gray-200"
                title="Siguiente"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volumen */}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
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

      {/* Botones de acción */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => navigate('/music/library')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
        >
          Biblioteca
        </button>
        <button
          onClick={() => navigate('/music/upload')}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
        >
          Subir canción
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
