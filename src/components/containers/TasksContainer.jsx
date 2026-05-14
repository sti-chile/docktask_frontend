import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTareasQuery } from '../../hooks/useTareasQuery';
import Swal from 'sweetalert2';
import TasksBoardView from '../views/TasksBoardView';
import CalendarView from '../../views/CalendarView';
import ViewSwitcher from '../common/ViewSwitcher';
import GanttBoard from '../GanttBoard';

const TasksContainer = ({ token, proyectoId = null }) => {
  const navigate = useNavigate();
  const { tareas = [], isLoading, error, eliminarTarea, cambiarEstado, duplicarTarea, actualizarFechaExpiracion } = useTareasQuery(token, proyectoId);
  const [draggedTarea, setDraggedTarea] = useState(null);
  const [currentDroppableId, setCurrentDroppableId] = useState(null);
  const [activeView, setActiveView] = useState('board');

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      eliminarTarea.mutate(id);
    }
  };

  const handleEdit = (tarea) => {
    navigate(`/edit/${tarea.id}`);
  };

  const handleEstadoChange = (id, nuevoEstado) => {
    cambiarEstado.mutate({ id, estado: nuevoEstado });
  };

  const handleDuplicar = (tarea) => {
    duplicarTarea.mutate(tarea.id);
  };

  const handleFechaExpiracionChange = (id, fecha) => {
    if (!id || !fecha) return;
    actualizarFechaExpiracion.mutate({ id, expiration_date: fecha });
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDragStart = (e, tarea) => {
    setDraggedTarea(tarea);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tarea.id);
  };

  const handleDragEnd = () => {
    setDraggedTarea(null);
    setCurrentDroppableId(null);
  };

  const handleDragOver = (e, estado) => {
    e.preventDefault();
    setCurrentDroppableId(estado);
  };

  const handleDrop = (e, estado) => {
    e.preventDefault();
    if (draggedTarea && draggedTarea.estado !== estado) {
      cambiarEstado.mutate({ id: draggedTarea.id, estado });
    }
    setDraggedTarea(null);
    setCurrentDroppableId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ViewSwitcher activeView={activeView} onChange={setActiveView} />
      {activeView === 'board' && (
        <TasksBoardView
          tareas={tareas}
          isLoading={isLoading}
          error={error}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onEstadoChange={handleEstadoChange}
          onDuplicar={handleDuplicar}
          onFechaExpiracionChange={handleFechaExpiracionChange}
          onCreateClick={handleCreateClick}
          onRetry={handleRetry}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
      {activeView === 'tasks' && (
        <div className="text-center text-gray-500 py-20 text-xl">Próximamente: vista de tareas</div>
      )}
      {activeView === 'calendar' && (
        <CalendarView tareas={tareas} />
      )}
      {activeView === 'gantt' && (
        <GanttBoard
          tareas={tareas}
          token={token}
        />
      )}
    </div>
  );
};

export default TasksContainer;
