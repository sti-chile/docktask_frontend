// CycleDetailPage — página de detalle de un ciclo
import React from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import CycleDetail from "../cycles/CycleDetail"

const CycleDetailPage = () => {
    const { workspaceId, cycleId } = useParams()
    const { token } = useAuth()
    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <CycleDetail
                token={token}
                workspaceId={parseInt(workspaceId)}
                cycleId={parseInt(cycleId)}
            />
        </div>
    )
}

export default CycleDetailPage
