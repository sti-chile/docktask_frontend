import { createContext, useContext, useEffect, useState } from "react";
import { getWorkspaces } from "@/api/workspaceApi";
import { useAuth } from "@/context/AuthContext";
import { createHttpClient } from "@/lib/httpClient";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { token, isGuest } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchWorkspaces = async () => {
      try {
        setLoading(true);

        if (isGuest) {
          // Guest: usar endpoint demo
          const api = createHttpClient(token);
          const data = await api.get("/api/v1/guest/demo-data");
          // Convertir a formato workspace esperado
          setWorkspaces([data.workspace]);
          setActiveWorkspace(data.workspace.id);
        } else {
          const data = await getWorkspaces(token);
          setWorkspaces(data);
          if (data.length > 0) setActiveWorkspace(data[0].id);
        }
      } catch (error) {
        console.error("Error al cargar workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [token, isGuest]);

  const value = {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    refreshWorkspaces: async () => {
      if (isGuest) return; // guests no refrescan
      const data = await getWorkspaces(token);
      setWorkspaces(data);
    },
    loading,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
