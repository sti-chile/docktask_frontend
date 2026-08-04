import React from "react"
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { FolderIcon } from "@heroicons/react/24/outline"
import { useProjectQuery } from "../../hooks/useProjectQuery"
import PageHeader from "../shared/PageHeader"

/**
 * Ruta de layout para todo lo que vive dentro de un proyecto.
 *
 * El equivalente en React Router a los route groups `(grupo)` de Next: una ruta
 * padre con `<Outlet/>`. El `:id` del proyecto vive en el PATH, así que cualquier
 * vista hija lo lee con `useParams()` y es imposible que se pierda al navegar o
 * al volver atrás. Antes cada vista recibía `proyectoId` por prop desde un wrapper
 * distinto, y la que no lo recibía mostraba las tareas de TODOS los proyectos.
 *
 * El botón de volver conserva el `workspace_id` si venimos de un workspace, para
 * no romper la cadena workspace → proyecto → tareas.
 */
const ProjectLayout = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { proyectos = [] } = useProjectQuery(token)

    const proyecto = proyectos.find((p) => String(p.id) === String(id))
    const workspaceId = searchParams.get("workspace_id") || proyecto?.workspace_id

    const volverAProyectos = () => {
        navigate(workspaceId ? `/mis-proyectos?workspace_id=${workspaceId}` : "/mis-proyectos")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title={proyecto?.nombre || "Proyecto"}
                description={proyecto?.descripcion}
                icon={FolderIcon}
                back={{ label: "Volver a proyectos", onClick: volverAProyectos }}
            />
            {/* El contexto viaja por la ruta; las hijas leen el id con useParams */}
            <Outlet />
        </div>
    )
}

export default ProjectLayout
