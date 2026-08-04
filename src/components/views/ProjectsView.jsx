import React from "react"
import { PlusIcon } from "@heroicons/react/24/outline/index.js"
import ProjectCard from "../ProjectCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const ProjectsView = ({
    proyectos = [],
    isLoading,
    error,
    onDelete,
    onEdit,
    onCreateClick,
    onRetry,
}) => {
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
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
                            Error al cargar los proyectos
                        </CardTitle>
                        <CardDescription>
                            Ha ocurrido un error al intentar cargar tus proyectos.
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
                    <h1 className="text-3xl font-bold text-gray-800">Mis Proyectos</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus proyectos y sus tareas</p>
                </div>
                <Button onClick={onCreateClick} className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Crear Proyecto
                </Button>
            </div>

            {!proyectos || proyectos.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-blue-100 p-3 mb-4">
                            <PlusIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No tienes proyectos creados
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Comienza creando tu primer proyecto para organizar tus tareas
                        </p>
                        <Button onClick={onCreateClick} size="lg">
                            Crear mi primer proyecto
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proyectos.map((proyecto) => (
                        <ProjectCard
                            key={proyecto.id}
                            proyecto={proyecto}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectsView
