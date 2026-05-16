import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, CalendarIcon, ChatBubbleLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

const ProjectCard = ({ proyecto, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(proyecto.id);
        Swal.fire(
          '¡Eliminado!',
          'El proyecto ha sido eliminado.',
          'success'
        );
      }
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(proyecto);
  };

  const handleClick = () => {
    navigate(`/mis-proyectos/${proyecto.id}/tareas`);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {proyecto.nombre}
          </CardTitle>
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
        </div>
        <CardDescription className="text-sm text-gray-500 line-clamp-2">
          {proyecto.descripcion || "Sin descripción."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span>{proyecto.total_tareas ?? 0} tareas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Creado el {format(new Date(proyecto.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <Badge variant="secondary" className="text-xs">
          {proyecto.estado || 'Activo'}
        </Badge>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600"
          >
            Ver tareas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/mis-proyectos/${proyecto.id}/gantt`);
            }}
          >
            <ChartBarIcon className="h-4 w-4" />
            Gantt
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
