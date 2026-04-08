import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline/index.js';
import MessageCardContainer from '../containers/MessageCardContainer';

const MessagesBoardView = ({
  mensajes = [],
  isLoading,
  error,
  onDelete,
  onEdit,
  onEstadoChange,
  onDuplicar,
  onFechaExpiracionChange,
  onCreateClick,
  onRetry,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const estados = ['urgente', 'pendiente', 'en_progreso', 'completado', 'archivado'];
  const getEstadoTitulo = (estado) => {
    switch (estado) {
      case 'urgente':
        return 'Urgente';
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'completado':
        return 'Completado';
      case 'archivado':
        return 'Archivado';
      default:
        return estado;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 text-lg mb-4">Error al cargar los mensajes</p>
        <button
          onClick={onRetry}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Mensajes</h1>
        <button
          onClick={onCreateClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Crear Mensaje
        </button>
      </div>

      {!mensajes || mensajes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">No tienes mensajes creados</p>
          <button
            onClick={onCreateClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200"
          >
            Crear mi primer mensaje
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estados.map((estado) => (
            <div
              key={estado}
              className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
              onDragOver={(e) => onDragOver(e, estado)}
              onDrop={(e) => onDrop(e, estado)}
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">{getEstadoTitulo(estado)}</h2>
              <div className="space-y-4">
                {mensajes
                  .filter((mensaje) => mensaje.estado === estado)
                  .map((mensaje) => (
                    <div
                      key={mensaje.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, mensaje)}
                      onDragEnd={onDragEnd}
                    >
                      <MessageCardContainer
                        mensaje={mensaje}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onEstadoChange={onEstadoChange}
                        onDuplicar={onDuplicar}
                        onFechaExpiracionChange={onFechaExpiracionChange}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesBoardView; 