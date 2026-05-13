import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMensajesQuery } from '../../hooks/useMensajesQuery';
import Swal from 'sweetalert2';
import MessagesBoardView from '../views/MessagesBoardView';
import CalendarView from '../../views/CalendarView';
import ViewSwitcher from '../common/ViewSwitcher';
import GanttBoard from '../GanttBoard';

const MessagesContainer = ({ token }) => {
  const navigate = useNavigate();
  const { mensajes = [], isLoading, error, eliminarMensaje, cambiarEstado, duplicarMensaje, actualizarFechaExpiracion } = useMensajesQuery(token);
  const [draggedMensaje, setDraggedMensaje] = useState(null);
  const [currentDroppableId, setCurrentDroppableId] = useState(null);
  const [activeView, setActiveView] = useState('board');

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el mensaje de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      eliminarMensaje.mutate(id);
    }
  };

  const handleEdit = (mensaje) => {
    navigate(`/edit/${mensaje.id}`);
  };

  const handleEstadoChange = (id, nuevoEstado) => {
    cambiarEstado.mutate({ id, estado: nuevoEstado });
  };

  const handleDuplicar = (mensaje) => {
    duplicarMensaje.mutate(mensaje.id);
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

  const handleDragStart = (e, mensaje) => {
    setDraggedMensaje(mensaje);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', mensaje.id);
  };

  const handleDragEnd = () => {
    setDraggedMensaje(null);
    setCurrentDroppableId(null);
  };

  const handleDragOver = (e, estado) => {
    e.preventDefault();
    setCurrentDroppableId(estado);
  };

  const handleDrop = (e, estado) => {
    e.preventDefault();
    if (draggedMensaje && draggedMensaje.estado !== estado) {
      cambiarEstado.mutate({ id: draggedMensaje.id, estado });
    }
    setDraggedMensaje(null);
    setCurrentDroppableId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ViewSwitcher activeView={activeView} onChange={setActiveView} />
      {activeView === 'board' && (
        <MessagesBoardView
          mensajes={mensajes}
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
        <CalendarView mensajes={mensajes} />
      )}
      {activeView === 'gantt' && (
        <GanttBoard
          mensajes={mensajes}
          token={token}
        />
      )}
    </div>
  );
};

export default MessagesContainer;
