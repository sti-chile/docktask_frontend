// ModuleDetail — vista de detalle de un módulo con sus tareas
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModulesQuery } from '../../hooks/useModulesQuery';
import ModuleProgressBar from './ModuleProgressBar';
import { ModuleStatusBadge, STATUS_LABELS } from './ModuleStatusBadge';
import EstadoSelect from '../EstadoSelect';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { createHttpClient } from '../../lib/httpClient';

const MODULE_STATUSES = ['planned', 'in-progress', 'completed', 'cancelled'];

const ModuleDetail = ({ token, workspaceId, moduleId }) => {
  const navigate = useNavigate();
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const {
    module,
    isModuleLoading,
    moduleTasks,
    actualizarModule,
    asignarTarea,
    removerTarea,
  } = useModulesQuery(token, workspaceId, { moduleId });

  const loading = isModuleLoading;
  const tasks = moduleTasks;

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await createHttpClient(token).patch(`/api/v1/tareas/${taskId}`, { estado: newStatus });
    } catch (e) {
      console.error('Error updating task status:', e);
    }
  };

  const handleRemoveTask = async (taskId) => {
    await removerTarea.mutateAsync({ taskId, moduleId });
  };

  const handleModuleStatusChange = async (newStatus) => {
    await actualizarModule.mutateAsync({ moduleId, status: newStatus });
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    await actualizarModule.mutateAsync({ moduleId, nombre: nameDraft.trim() });
    setEditName(false);
  };

  // Fetch all workspace tasks for the assign dropdown — on-demand only
  const fetchAllTasks = useCallback(async () => {
    if (!token || !workspaceId) return;
    try {
      const data = await createHttpClient(token).get(`/api/v1/workspaces/${workspaceId}/tasks`);
      setAllTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (e) {
      console.error('Error fetching workspace tasks:', e);
    }
  }, [token, workspaceId]);

  const handleShowAssign = () => {
    fetchAllTasks();
    setShowAssign(true);
    setSelectedTaskId('');
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId) return;
    setAssignLoading(true);
    try {
      await asignarTarea.mutateAsync({ taskId: parseInt(selectedTaskId), moduleId });
      setShowAssign(false);
      setSelectedTaskId('');
    } finally {
      setAssignLoading(false);
    }
  };

  const completedTasks = tasks.filter(
    (t) => t.estado === 'completado' || t.estado === 'Completada' || t.estado === 'completada'
  ).length;
  const totalTasks = tasks.length;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-CL', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch { return '—'; }
  };

  // Tasks already in this module — exclude from assign dropdown
  const assignedTaskIds = new Set(tasks.map((t) => t.id));
  const unassignedTasks = allTasks.filter((t) => !assignedTaskIds.has(t.id));

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Módulo no encontrado</p>
        <button
          onClick={() => navigate(`/workspace/${workspaceId}/modules`)}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← Volver a módulos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(`/workspace/${workspaceId}/modules`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a módulos
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {editName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="text-xl font-bold px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-1 text-sm bg-indigo-600 text-white rounded-md"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditName(false)}
                  className="px-2 py-1 text-sm text-gray-500"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => { setEditName(true); setNameDraft(module.nombre); }}
                title="Editar nombre"
              >
                {module.nombre}
              </h1>
            )}
            {module.descripcion && (
              <p className="text-gray-500 mt-1">{module.descripcion}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
              <ModuleStatusBadge status={module.status} />
              <span>{formatDate(module.start_date)} → {formatDate(module.target_date)}</span>
              <span>{totalTasks} tareas</span>
              {module.archived_at && (
                <span className="text-xs text-amber-600 font-medium">
                  Archivado el {formatDate(module.archived_at)}
                </span>
              )}
            </div>
          </div>

          {/* Module status selector */}
          <div className="flex items-center gap-2">
            <select
              value={module.status}
              onChange={(e) => handleModuleStatusChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {MODULE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <ModuleProgressBar completed={completedTasks} total={totalTasks} size="lg" />
        </div>
      </div>

      {/* Tasks list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tareas · {totalTasks}
          </h2>
          <button
            onClick={handleShowAssign}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Asignar tarea
          </button>
        </div>

        {/* Assign task form */}
        {showAssign && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Seleccionar tarea...</option>
              {unassignedTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} · {t.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignTask}
              disabled={!selectedTaskId || assignLoading}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {assignLoading ? 'Asignando...' : 'Asignar'}
            </button>
            <button
              onClick={() => { setShowAssign(false); setSelectedTaskId(''); }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Este módulo no tiene tareas aún
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.nombre}</p>
                  <p className="text-xs text-gray-400">
                    #{t.id} · {t.proyecto_id ? `Proyecto ${t.proyecto_id}` : 'Sin proyecto'}
                  </p>
                </div>
                <div className="w-32">
                  <EstadoSelect
                    estado={t.estado}
                    onChange={(newStatus) => handleStatusChange(t.id, newStatus)}
                  />
                </div>
                <button
                  onClick={() => handleRemoveTask(t.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-xs px-2 py-1"
                  title="Remover del módulo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;
