import { useWorkspace } from "@/context/WorkspaceContext";

export const useWorkspaces = () => {
  const ctx = useWorkspace();
  if (!ctx) throw new Error("useWorkspaces debe usarse dentro de <WorkspaceProvider>");
  return ctx;
};
