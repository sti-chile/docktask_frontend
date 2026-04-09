import { useWorkspaces } from "@/hooks/useWorkspaces";

export default function Sidebar() {
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
    <div className="w-64 bg-gray-900 text-white p-3 flex flex-col h-screen">
      <h2 className="text-sm font-bold mb-3">Workspaces</h2>

      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => setActiveWorkspace(ws.id)}
          className={`p-2 rounded-md text-left hover:bg-gray-800 ${
            ws.id === activeWorkspace ? "bg-gray-800" : ""
          }`}
        >
          {ws.name}
        </button>
      ))}

      <button className="mt-auto text-sm text-gray-400 hover:text-white">
        + Nuevo espacio
      </button>
    </div>
  );
}
