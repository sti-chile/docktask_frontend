import { createContext, useContext, useEffect, useState } from "react";
import { getWorkspaces } from "@/api/workspaceApi";
import { useAuth } from "@/context/AuthContext";
import { useGuestWorkspace } from "@/hooks/useGuestStore";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { token, isGuest } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guest: cargar desde useGuestWorkspace
  const guest = useGuestWorkspace(token, isGuest);

  useEffect(() => {
    if (!token) return;

    const fetchWorkspaces = async () => {
      try {
        setLoading(true);

        if (isGuest) {
          // Los datos vienen de useGuestWorkspace — se aplican cuando el query carga
          setWorkspaces(guest.workspaces);
          if (guest.workspaces.length > 0) setActiveWorkspace(guest.workspaces[0].id);
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
  }, [token, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresco cuando datos guest llegan
  useEffect(() => {
    if (!isGuest || !guest.workspaces.length) return;
    setWorkspaces(guest.workspaces);
    setActiveWorkspace((prev) => prev || guest.workspaces[0]?.id);
    setLoading(false);
  }, [guest.workspaces, isGuest]);

  const value = {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    refreshWorkspaces: async () => {
      if (isGuest) return;
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
