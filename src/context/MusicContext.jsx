import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { httpClient } from '../lib/httpClient';
import { toast } from 'react-toastify';

const MusicContext = createContext(null);

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider');
  return ctx;
};

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // Whenever currentTrack changes → fetch stream URL and update audio src
  useEffect(() => {
    if (!currentTrack) return;
    const fetchAndLoad = async () => {
      try {
        const data = await httpClient.get(`/api/v1/music/tracks/${currentTrack.id}/stream`);
        const { stream_url } = data;
        if (audioRef.current) {
          audioRef.current.src = stream_url;
          audioRef.current.load();
          if (isPlaying) {
            audioRef.current.play().catch(e => {
              toast.error('No se pudo reproducir: ' + e.message);
            });
          }
        }
      } catch (err) {
        console.error('[MusicContext] Error fetching stream URL:', err);
        toast.error('No se pudo cargar el audio');
      }
    };
    fetchAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(e => toast.error('No se pudo reproducir: ' + e.message));
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => toast.error('No se pudo reproducir: ' + e.message));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    setCurrentTrack(playlist[nextIdx]);
    setIsPlaying(true);
  }, [playlist, currentIndex]);

  const prev = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    setCurrentTrack(playlist[prevIdx]);
    setIsPlaying(true);
  }, [playlist, currentIndex]);

  const seek = useCallback((seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolumeLevel = useCallback((v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // Load a new playlist and start at a specific index
  const loadPlaylist = useCallback((tracks, startIndex = 0) => {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MusicContext.Provider value={{
      audioRef,
      currentTrack, setCurrentTrack,
      playlist, setPlaylist,
      currentIndex, setCurrentIndex,
      isPlaying, setIsPlaying,
      currentTime, duration,
      volume,
      play, pause, togglePlay,
      next, prev,
      seek,
      setVolume: setVolumeLevel,
      loadPlaylist,
      formatTime,
    }}>
      {children}

      {/* The audio element lives here permanently — never unmounts */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={next}
        onError={(e) => {
          console.error('[MusicContext] Audio error:', e.target.error);
          toast.error(`Error de audio: ${e.target.error?.message || 'No se pudo cargar'}`);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </MusicContext.Provider>
  );
};
