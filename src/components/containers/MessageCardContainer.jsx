import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageCard from '../views/MessageCard';

const MessageCardContainer = ({ 
  mensaje, 
  onDelete, 
  onEdit, 
  onEstadoChange, 
  onDuplicar, 
  onFechaExpiracionChange,
  onDragStart,
  onDragEnd,
  isDragging = false,
  currentDroppableId = null
}) => {
  const navigate = useNavigate();
  const [localEstado, setLocalEstado] = useState(mensaje.estado);

  useEffect(() => {
    setLocalEstado(mensaje.estado);
  }, [mensaje.estado]);

  const handleEstadoChange = (id, nuevoEstado) => {
    setLocalEstado(nuevoEstado);
    onEstadoChange(id, nuevoEstado);
  };

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, mensaje);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleEdit = (mensaje) => {
    navigate(`/edit/${mensaje.id}`);
  };

  // Si estamos arrastrando y tenemos un droppableId, usamos ese estado
  const estadoActual = isDragging && currentDroppableId ? currentDroppableId : localEstado;

  return (
    <MessageCard
      mensaje={mensaje}
      localEstado={estadoActual}
      onDelete={() => onDelete(mensaje.id)}
      onEdit={() => onEdit(mensaje)}
      onEstadoChange={handleEstadoChange}
      onDuplicar={() => onDuplicar(mensaje)}
      onFechaExpiracionChange={onFechaExpiracionChange}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      isDragging={isDragging}
      currentDroppableId={currentDroppableId}
    />
  );
};

export default MessageCardContainer; 