import { createHttpClient } from "../lib/httpClient"

export const getWorkspaces = async (token) => {
    const api = createHttpClient(token)
    return await api.get("/api/v1/workspaces")
}

export const createWorkspace = async (payload, token) => {
    const api = createHttpClient(token)
    return await api.post("/api/v1/workspaces", payload)
}
