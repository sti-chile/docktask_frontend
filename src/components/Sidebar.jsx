import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const { isGuest } = useAuth();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isLoading,
    isError,
  } = useWorkspaces();

  if (isLoading) return <div className="p-4 text-gray-400">Cargando...</div>;
  if (isError) return <div className="p-4 text-red-500">Error cargando workspaces.</div>;

  return (
    <div className="w-64 bg-gray-900 text-white p-3 flex flex-col h-screen sidebar-workspaces">
      <h2 className="text-sm font-bold mb-3">Workspaces</h2>

      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => setActiveWorkspace(ws.id)}
          className={`flex items-center gap-2 p-2 rounded-md text-left hover:bg-gray-800 ${
            ws.id === activeWorkspace ? "bg-gray-800" : ""
          }`}
        >
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {ws.icono ? (
              <span className="text-lg">{ws.icono}</span>
            ) : (
              <span className="workspace-initial text-xs font-bold bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                {(ws.nombre || ws.name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span className="truncate">{ws.nombre || ws.name}</span>
        </button>
      ))}

      {/* CTA para guest */}
      {isGuest && (
        <div className="mt-4 p-3 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
          <Link
            to="/register"
            className="register-cta flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors w-full"
          >
            🚀 Crear cuenta gratis
          </Link>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Guarda tus tareas, crea proyectos y mucho más.
          </p>
        </div>
      )}

      {!isGuest && (
        <button className="mt-auto text-sm text-gray-400 hover:text-white">
          + Nuevo espacio
        </button>
      )}
    </div>
  );
}
