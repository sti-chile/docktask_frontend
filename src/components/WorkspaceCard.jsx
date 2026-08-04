import React from "react"
import { useNavigate } from "react-router-dom"
import {
    PencilIcon,
    TrashIcon,
    ShareIcon,
    LockClosedIcon,
    FolderOpenIcon,
} from "@heroicons/react/24/outline"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Swal from "sweetalert2"

const WorkspaceCard = ({ workspace, onDelete, onEdit, isOwner }) => {
    const navigate = useNavigate()

    const handleDelete = (e) => {
        e.stopPropagation()
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(workspace.id)
                Swal.fire("¡Eliminado!", "El workspace ha sido eliminado.", "success")
            }
        })
    }

    const handleEdit = (e) => {
        e.stopPropagation()
        onEdit(workspace)
    }

    const handleClick = () => {
        navigate(`/mis-proyectos?workspace_id=${workspace.id}`)
    }

    const estadoColor = {
        activo: "bg-green-100 text-green-700",
        inactivo: "bg-gray-100 text-gray-500",
        archivado: "bg-yellow-100 text-yellow-700",
    }

    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={handleClick}
        >
            <CardHeader className="space-y-1">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        {workspace.nombre}
                    </CardTitle>
                    {isOwner && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleEdit}
                                className="h-8 w-8"
                            >
                                <PencilIcon className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleDelete}
                                className="h-8 w-8"
                            >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    )}
                </div>
                <CardDescription className="text-sm text-gray-500 line-clamp-2">
                    {workspace.descripcion || "Sin descripción."}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {workspace.is_shared ? (
                            <>
                                <ShareIcon className="h-4 w-4 text-blue-400" />
                                <span>Compartido</span>
                            </>
                        ) : (
                            <>
                                <LockClosedIcon className="h-4 w-4 text-gray-400" />
                                <span>Privado</span>
                            </>
                        )}
                        <span className="mx-1">·</span>
                        <FolderOpenIcon className="h-4 w-4 text-gray-400" />
                        <span>Ver proyectos</span>
                    </div>
                    {workspace.created_at && (
                        <div className="text-sm text-gray-400">
                            Creado el{" "}
                            {format(new Date(workspace.created_at), "d 'de' MMMM 'de' yyyy", {
                                locale: es,
                            })}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4">
                <Badge
                    className={`text-xs ${estadoColor[workspace.estado] || estadoColor.activo}`}
                    variant="outline"
                >
                    {workspace.estado || "activo"}
                </Badge>
                {!isOwner && (
                    <span className="text-xs text-blue-400 font-medium">Compartido contigo</span>
                )}
            </CardFooter>
        </Card>
    )
}

export default WorkspaceCard
