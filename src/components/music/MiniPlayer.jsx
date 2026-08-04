import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMusic } from "../../context/MusicContext"

// Hidden on these routes — user is already in the full player
const HIDDEN_ROUTES = ["/music", "/music/player", "/music/library", "/music/upload"]

const MiniPlayer = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        next,
        prev,
        seek,
        formatTime,
    } = useMusic()

    if (!currentTrack) return null
    if (HIDDEN_ROUTES.includes(location.pathname)) return null

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 select-none"
            style={{
                background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                borderTop: "2px solid #333",
                boxShadow: "inset 0 1px 0 #444, inset 0 -1px 0 #000, 0 -4px 20px rgba(0,0,0,0.8)",
                fontFamily: "monospace",
            }}
        >
            {/* Progress bar — top of the bar */}
            <div
                className="relative h-1 w-full cursor-pointer"
                style={{ background: "#111" }}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const ratio = (e.clientX - rect.left) / rect.width
                    seek(ratio * duration)
                }}
            >
                <div
                    className="absolute top-0 left-0 h-full transition-none"
                    style={{
                        width: `${progress}%`,
                        background: "#00ff00",
                        boxShadow: "0 0 6px #00ff00",
                    }}
                />
            </div>

            {/* Main row */}
            <div className="flex items-center px-4 py-2 gap-4">
                {/* DT Logo */}
                <div
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded cursor-pointer"
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        boxShadow:
                            "inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.4)",
                    }}
                    onClick={() => navigate("/music")}
                >
                    <span className="text-white font-bold text-xs">DT</span>
                </div>

                {/* Track info — clickable → navigate to player */}
                <div
                    className="flex-1 min-w-0 cursor-pointer overflow-hidden"
                    onClick={() => navigate("/music/player")}
                >
                    <div className="overflow-hidden whitespace-nowrap">
                        <span
                            className="inline-block"
                            style={{
                                color: "#00ff00",
                                fontSize: "0.75rem",
                                letterSpacing: "0.05em",
                                animation:
                                    currentTrack.title.length > 30
                                        ? "marquee 8s linear infinite"
                                        : "none",
                            }}
                        >
                            {currentTrack.title}
                        </span>
                    </div>
                    <div style={{ color: "#666", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                        {currentTrack.artist || "ARTISTA DESCONOCIDO"}
                    </div>
                </div>

                {/* Time display */}
                <div
                    style={{
                        color: "#00ff00",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        textShadow: "0 0 8px #00ff00",
                        minWidth: "80px",
                        textAlign: "center",
                    }}
                >
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <WinampButton onClick={prev} title="Anterior">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                    </WinampButton>

                    <WinampButton
                        onClick={togglePlay}
                        title={isPlaying ? "Pausa" : "Reproducir"}
                        primary
                    >
                        {isPlaying ? (
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </WinampButton>

                    <WinampButton onClick={next} title="Siguiente">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                    </WinampButton>
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    )
}

const WinampButton = ({ onClick, children, title, primary }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            background: primary
                ? "linear-gradient(180deg, #444 0%, #222 100%)"
                : "linear-gradient(180deg, #333 0%, #1a1a1a 100%)",
            border: "1px solid #555",
            boxShadow:
                "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.5)",
            color: primary ? "#00ff00" : "#aaa",
            borderRadius: "3px",
            cursor: "pointer",
            padding: primary ? "6px 10px" : "5px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "filter 0.1s",
        }}
        onMouseDown={(e) =>
            (e.currentTarget.style.boxShadow =
                "inset 1px 1px 0 rgba(0,0,0,0.5), inset -1px -1px 0 rgba(255,255,255,0.1)")
        }
        onMouseUp={(e) =>
            (e.currentTarget.style.boxShadow =
                "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.5)")
        }
        onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow =
                "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.5)")
        }
    >
        {children}
    </button>
)

export default MiniPlayer
