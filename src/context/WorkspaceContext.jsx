import { createContext, useContext, useEffect, useState } from "react";
import { getWorkspaces } from "@/api/workspaceApi";
import { useAuth } from "@/context/AuthContext"; // si ya tienes AuthContext

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { token } = useAuth(); // obtiene JWT del contexto de autenticación
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaces(token);
        setWorkspaces(data);
        if (data.length > 0) setActiveWorkspace(data[0].id);
      } catch (error) {
        console.error("Error al cargar workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [token]);

  const value = {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    refreshWorkspaces: async () => {
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
