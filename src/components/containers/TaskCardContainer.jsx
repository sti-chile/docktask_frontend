import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../views/TaskCard';

const TaskCardContainer = ({
  tarea,
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
  const [localEstado, setLocalEstado] = useState(tarea.estado);

  useEffect(() => {
    setLocalEstado(tarea.estado);
  }, [tarea.estado]);

  const handleEstadoChange = (id, nuevoEstado) => {
    setLocalEstado(nuevoEstado);
    onEstadoChange(id, nuevoEstado);
  };

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, tarea);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleEdit = (tarea) => {
    navigate(`/edit/${tarea.id}`);
  };

  // Si estamos arrastrando y tenemos un droppableId, usamos ese estado
  const estadoActual = isDragging && currentDroppableId ? currentDroppableId : localEstado;

  return (
    <TaskCard
      tarea={tarea}
      localEstado={estadoActual}
      onDelete={() => onDelete(tarea.id)}
      onEdit={() => onEdit(tarea)}
      onEstadoChange={handleEstadoChange}
      onDuplicar={() => onDuplicar(tarea)}
      onFechaExpiracionChange={onFechaExpiracionChange}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      isDragging={isDragging}
      currentDroppableId={currentDroppableId}
    />
  );
};

export default TaskCardContainer;
