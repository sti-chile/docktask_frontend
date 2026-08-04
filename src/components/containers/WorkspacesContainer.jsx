import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useWorkspaceQuery } from "../../hooks/useWorkspaceQuery"
import { toast } from "react-toastify"
import WorkspacesView from "../views/WorkspacesView"
import { jwtDecode } from "jwt-decode"

const WorkspacesContainer = ({ token }) => {
    const navigate = useNavigate()
    const { workspaces, isLoading, error, eliminarWorkspace } = useWorkspaceQuery(token)

    const currentUserId = (() => {
        try {
            return jwtDecode(token)?.sub
        } catch {
            return null
        }
    })()

    useEffect(() => {
        if (error) {
            toast.error("Error al cargar los workspaces")
        }
    }, [error])

    const handleDelete = async (id) => {
        try {
            await eliminarWorkspace.mutateAsync(id)
        } catch (error) {
            console.error("Error al eliminar el workspace:", error)
        }
    }

    const handleEdit = (workspace) => {
        navigate(`/editar-workspace/${workspace.id}`)
    }

    const handleCreateClick = () => {
        navigate("/crear-workspace")
    }

    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <WorkspacesView
            workspaces={workspaces}
            isLoading={isLoading}
            error={error}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onCreateClick={handleCreateClick}
            onRetry={handleRetry}
            currentUserId={currentUserId}
        />
    )
}

export default WorkspacesContainer
