import React from "react"
import { PlusIcon, RectangleGroupIcon } from "@heroicons/react/24/outline"
import WorkspaceCard from "../WorkspaceCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const WorkspacesView = ({
    workspaces = [],
    isLoading,
    error,
    onDelete,
    onEdit,
    onCreateClick,
    onRetry,
    currentUserId,
}) => {
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mt-2" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-red-500">
                            Error al cargar los workspaces
                        </CardTitle>
                        <CardDescription>
                            Ha ocurrido un error al intentar cargar tus workspaces.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={onRetry} className="w-full">
                            Reintentar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mis Workspaces</h1>
                    <p className="text-gray-500 mt-1">
                        Organiza y comparte tus espacios de trabajo
                    </p>
                </div>
                <Button onClick={onCreateClick} className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Crear Workspace
                </Button>
            </div>

            {workspaces.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-indigo-100 p-3 mb-4">
                            <RectangleGroupIcon className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No tienes workspaces creados
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Crea tu primer workspace para organizar tu trabajo
                        </p>
                        <Button onClick={onCreateClick} size="lg">
                            Crear mi primer workspace
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws) => (
                        <WorkspaceCard
                            key={ws.id}
                            workspace={ws}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            isOwner={String(ws.owner_id) === String(currentUserId)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default WorkspacesView
