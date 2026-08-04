// CyclesPage — página principal de ciclos dentro de un workspace
import React from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import CycleList from "../cycles/CycleList"

const CyclesPage = () => {
    const { workspaceId } = useParams()
    const { token } = useAuth()
    return (
        <div className="px-4 py-6 max-w-3xl mx-auto">
            <CycleList token={token} workspaceId={parseInt(workspaceId)} />
        </div>
    )
}

export default CyclesPage
