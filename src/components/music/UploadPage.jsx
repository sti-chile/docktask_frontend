import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpClient } from '../../lib/httpClient';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validar tipo
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(selected.type)) {
      toast.error('Formato no soportado. Solo MP3, M4A, WAV, OGG.');
      return;
    }

    // Validar tamaño (50 MB)
    if (selected.size > 50 * 1024 * 1024) {
      toast.error('El archivo excede 50 MB');
      return;
    }

    setFile(selected);
    // Extraer metadatos del nombre de archivo
    if (!title) {
      const baseName = selected.name.replace(/\.[^/.]+$/, '');
      setTitle(baseName);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecciona un archivo');
      return;
    }
    if (!title.trim()) {
      toast.error('Ingresa un título');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Solicitar pre‑signed URL al backend
      const response = await httpClient.post('/api/v1/music/tracks/upload', {
        title,
        artist,
        album,
        file_size: file.size,
        mime_type: file.type,
      });

      const { upload_url, track_id } = response;
      setTrackId(track_id);

      // 2. Subir directamente a S3 usando fetch
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', upload_url, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          // 3. Confirmar subida exitosa al backend
          try {
            await httpClient.post(`/api/v1/music/tracks/${track_id}/confirm`, {
              duration: 0, // TODO: extraer duración del archivo con Web Audio API
            });
            toast.success('Canción subida exitosamente');
            navigate('/music/library');
          } catch (confirmError) {
            console.error('Error confirmando subida:', confirmError);
            toast.error('Subida completada pero error registrando metadatos');
          }
        } else {
          toast.error('Error subiendo archivo a S3');
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        toast.error('Error de red al subir');
        setIsUploading(false);
      };

      xhr.send(file);
    } catch (error) {
      console.error('Error obteniendo pre‑signed URL:', error);
      toast.error('No se pudo iniciar la subida');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/music/library')}
          className="text-primary hover:text-primary/80 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Volver a biblioteca
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Subir canción</h1>
        <p className="text-gray-600 mt-2">
          Sube archivos MP3, M4A, WAV o OGG (hasta 50 MB). La subida es directa a AWS S3.
        </p>
      </div>

      {/* Área de drag‑and‑drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${file ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="audio/*"
          className="hidden"
        />
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-gray-700">
          {file ? (
            <span className="font-medium">{file.name}</span>
          ) : (
            <>
              Arrastra un archivo de audio aquí o <span className="text-primary">haz clic para seleccionar</span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Máximo 50 MB. Formatos soportados: MP3, M4A, WAV, OGG.
        </p>
      </div>

      {/* Metadatos */}
      {file && (
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Información de la pista</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la canción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artista
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nombre del artista"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Álbum
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Álbum (opcional)"
              />
            </div>
          </div>

          {/* Barra de progreso */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                No cierres esta ventana hasta que la subida se complete.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => navigate('/music/library')}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${isUploading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-primary-foreground`}
            >
              {isUploading ? 'Subiendo...' : 'Subir canción'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;