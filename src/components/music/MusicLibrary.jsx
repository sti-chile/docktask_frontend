import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { httpClient } from "../../lib/httpClient"

const MusicLibrary = () => {
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTracks, setSelectedTracks] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        fetchTracks()
        fetchPlaylists()
    }, [])

    const fetchTracks = async () => {
        try {
            setLoading(true)
            const data = await httpClient.get("/api/v1/music/tracks")
            setTracks(data || [])
        } catch (error) {
            console.error("Error cargando tracks:", error)
            toast.error("No se pudieron cargar las pistas")
        } finally {
            setLoading(false)
        }
    }

    const fetchPlaylists = async () => {
        try {
            const data = await httpClient.get("/api/v1/music/playlists")
            setPlaylists(data || [])
        } catch (error) {
            console.error("Error cargando playlists:", error)
        }
    }

    const handleDeleteTrack = async (trackId) => {
        if (!window.confirm("¿Eliminar esta pista permanentemente?")) return
        try {
            await httpClient.delete(`/api/v1/music/tracks/${trackId}`)
            toast.success("Pista eliminada")
            setTracks(tracks.filter((t) => t.id !== trackId))
        } catch (error) {
            console.error("Error eliminando track:", error)
            toast.error("No se pudo eliminar la pista")
        }
    }

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) {
            toast.error("Ingresa un nombre para la playlist")
            return
        }
        try {
            const data = await httpClient.post("/api/v1/music/playlists", {
                name: newPlaylistName,
                description: "",
                is_shared: false,
            })
            toast.success("Playlist creada")
            setPlaylists([...playlists, data])
            setNewPlaylistName("")
            setShowNewPlaylistModal(false)
        } catch (error) {
            console.error("Error creando playlist:", error)
            toast.error("No se pudo crear la playlist")
        }
    }

    const handleAddToPlaylist = async (playlistId) => {
        if (selectedTracks.length === 0) {
            toast.warn("Selecciona al menos una pista")
            return
        }
        try {
            for (const trackId of selectedTracks) {
                await httpClient.post(`/api/v1/music/playlists/${playlistId}/tracks`, {
                    track_id: trackId,
                })
            }
            toast.success(`${selectedTracks.length} pista(s) agregadas`)
            setSelectedTracks([])
        } catch (error) {
            console.error("Error agregando tracks a playlist:", error)
            toast.error("No se pudieron agregar las pistas")
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
        return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

    const formatDuration = (seconds) => {
        if (!seconds) return "--:--"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-music-bg text-music-text min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-music-text">Biblioteca de Música</h1>
                <div className="space-x-3">
                    <button
                        onClick={() => navigate("/music/upload")}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                    >
                        Subir canción
                    </button>
                    <button
                        onClick={() => setShowNewPlaylistModal(true)}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium"
                    >
                        Nueva playlist
                    </button>
                </div>
            </div>

            {/* Modal nueva playlist */}
            {showNewPlaylistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-music-card border border-music-border rounded-lg p-6 w-full max-w-md text-music-text">
                        <h3 className="text-xl font-bold mb-4">Crear playlist</h3>
                        <input
                            type="text"
                            className="w-full border border-music-border bg-music-bg text-music-text rounded-lg px-4 py-2 mb-4"
                            placeholder="Nombre de la playlist"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowNewPlaylistModal(false)}
                                className="px-4 py-2 border border-music-border bg-music-bg text-music-text rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreatePlaylist}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Barra de acciones con selección */}
            {selectedTracks.length > 0 && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 flex justify-between items-center">
                    <span className="font-medium">
                        {selectedTracks.length} pista(s) seleccionada(s)
                    </span>
                    <div className="space-x-3">
                        <select
                            className="border border-gray-300 rounded-lg px-4 py-2"
                            onChange={(e) => handleAddToPlaylist(e.target.value)}
                            defaultValue=""
                        >
                            <option value="">Agregar a playlist...</option>
                            {playlists.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setSelectedTracks([])}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de tracks */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Cargando pistas...</p>
                </div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-12 bg-music-card rounded-lg">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-music-text">
                        Sin pistas de música
                    </h3>
                    <p className="mt-1 text-gray-400">Sube tu primera canción en formato MP3.</p>
                    <button
                        onClick={() => navigate("/music/upload")}
                        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                    >
                        Subir canción
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className={`bg-music-card rounded-lg shadow border ${selectedTracks.includes(track.id) ? "border-primary ring-2 ring-primary/30" : "border-music-border"}`}
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-music-text truncate">
                                            {track.title}
                                        </h4>
                                        <p className="text-gray-400 text-sm">
                                            {track.artist || "Artista desconocido"}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {track.album || "Álbum desconocido"}
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedTracks.includes(track.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedTracks([...selectedTracks, track.id])
                                            } else {
                                                setSelectedTracks(
                                                    selectedTracks.filter((id) => id !== track.id)
                                                )
                                            }
                                        }}
                                        className="h-5 w-5 text-primary rounded accent-primary"
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
                                    <div>
                                        <span className="font-medium">Duración:</span>{" "}
                                        {formatDuration(track.duration)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Tamaño:</span>{" "}
                                        {formatFileSize(track.file_size)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Subido:</span>{" "}
                                        {new Date(track.created_at).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Formato:</span>{" "}
                                        {track.mime_type.split("/")[1]}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => navigate(`/music/player?track=${track.id}`)}
                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                                    >
                                        Reproducir
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTrack(track.id)}
                                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MusicLibrary
