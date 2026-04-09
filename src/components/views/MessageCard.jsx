import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EstadoSelect from '../EstadoSelect';
import ExpirationInfo from '../common/ExpirationInfo';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MessageCard = ({
  mensaje,
  onEstadoChange,
  onDelete,
  onDuplicar,
  onFechaExpiracionChange,
  isDragging = false,
  currentDroppableId = null
}) => {
  const navigate = useNavigate();
  const [localEstado, setLocalEstado] = useState(mensaje.estado);

  const handleEstadoChange = (nuevoEstado) => {
    if (onEstadoChange) {
      onEstadoChange(mensaje.id, nuevoEstado);
    }
  };

  // Permite drag & drop
  const estadoActual = isDragging && currentDroppableId ? currentDroppableId : localEstado;

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch {
      return 'Fecha inválida';
    }
  };

  // --- Render ---
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`animate-fade-in transition-all duration-300 ${isDragging ? "opacity-50 cursor-grabbing" : "cursor-pointer hover:shadow-md"}`}
        >
          <CardHeader className="pb-2 border-b flex flex-col sm:flex-row justify-between gap-2">
            <CardTitle className="text-lg font-semibold break-words">{mensaje.nombre}</CardTitle>
            <div className="flex-wrap w-full max-w-xs sm:w-60" onClick={e => e.stopPropagation()}>
              <EstadoSelect
                estado={estadoActual}
                onChange={(nuevoEstado) => {
                  setLocalEstado(nuevoEstado);
                  handleEstadoChange(nuevoEstado);
                }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {/* Descripción resumida */}
            <p className="text-gray-600 mb-4 line-clamp-3">{mensaje.mensaje}</p>

            <div className="flex items-center text-sm text-gray-500 border-t pt-4 mb-4">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>
                Actualizado: {formatDate(mensaje.fecha_actualizacion || mensaje.updated_at || mensaje.fecha)}
              </span>
            </div>

            <div onClick={e => e.stopPropagation()}>
              <ExpirationInfo
                expirationDate={mensaje.expiration_date}
                onDateChange={(fecha) => {
                  if (onFechaExpiracionChange && fecha != null) {
                      onFechaExpiracionChange(mensaje.id, fecha);
                    }
                  }}
                />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation(); // Evita que abra modal
                        navigate(`/edit/${mensaje.id}`);
                      }}
                      className="h-9 w-9 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(mensaje.id);
                      }}
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        onDuplicar(mensaje);
                      }}
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* MODAL AMPLIADO */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {mensaje.nombre}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-600">Estado</h3>
              <p className="text-gray-900">{mensaje.estado}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Fecha</h3>
              <p className="text-gray-900">{formatDate(mensaje.fecha)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Fecha Actualización</h3>
              <p className="text-gray-900">{formatDate(mensaje.fecha_actualizacion)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Fecha Expiración</h3>
              <p className="text-gray-900">{formatDate(mensaje.expiration_date)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Descripción completa</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{mensaje.mensaje}</p>
          </div>
          <div className="flex justify-end gap-4">
            {/* Mismos botones de acción, opcional en modal */}
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDuplicar(mensaje); }}
              className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDelete(mensaje.id); }}
              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onFechaExpiracionChange(mensaje.id, new Date().toISOString());
              }}
              className="h-9 w-9 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
            >
              <ClockIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); navigate(`/edit/${mensaje.id}`); }}
              className="h-9 w-9 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageCard;
