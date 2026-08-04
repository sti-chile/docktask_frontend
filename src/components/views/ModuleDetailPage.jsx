// ModuleDetailPage — página de detalle de un módulo
import React from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import ModuleDetail from "../modules/ModuleDetail"

const ModuleDetailPage = () => {
    const { workspaceId, moduleId } = useParams()
    const { token } = useAuth()
    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <ModuleDetail
                token={token}
                workspaceId={parseInt(workspaceId)}
                moduleId={parseInt(moduleId)}
            />
        </div>
    )
}

export default ModuleDetailPage
