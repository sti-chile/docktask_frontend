import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline/index.js';
import MessageCardContainer from '../containers/MessageCardContainer';
import MessageCardSkeleton from '../ui/MessageCardSkeleton';
import { AnimatePresence, motion } from "framer-motion";

const MessagesView = ({
  mensajes = [],
  isLoading,
  error,
  onDelete,
  onEdit,
  onEstadoChange,
  onDuplicar,
  onFechaExpiracionChange,
  onCreateClick,
  onRetry
}) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <MessageCardSkeleton key={i} />
          ))}
        </div>
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
        <AnimatePresence>
          {mensajes.map((mensaje) => (
            <motion.div key={mensaje.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MessageCardContainer
                key={mensaje.id}
                mensaje={mensaje}
                onDelete={onDelete}
                onEdit={onEdit}
                onEstadoChange={onEstadoChange}
                onDuplicar={onDuplicar}
                onFechaExpiracionChange={onFechaExpiracionChange}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MessagesView; 