// CycleDetail — vista de detalle de un ciclo con sus tareas
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCycles } from '../../api/cyclesApi';
import CycleProgressBar from './CycleProgressBar';
import { CycleStatusBadge } from './CycleStatusBadge';
import EstadoSelect from '../EstadoSelect';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createHttpClient } from '../../lib/httpClient';

const CycleDetail = ({ token, workspaceId, cycleId }) => {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const fetchData = useCallback(async () => {
    if (!token || !workspaceId || !cycleId) return;
    setLoading(true);
    try {
      const [cycleData, tasksData] = await Promise.all([
        apiCycles(token).get(workspaceId, cycleId),
        createHttpClient(token).get(`/api/v1/workspaces/${workspaceId}/tasks?cycle_id=${cycleId}`),
      ]);
      setCycle(cycleData);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || []);
    } catch (e) {
      console.error('Error fetching cycle detail:', e);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, cycleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await createHttpClient(token).patch(`/api/v1/tareas/${taskId}`, { estado: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, estado: newStatus } : t))
      );
    } catch (e) {
      console.error('Error updating task status:', e);
    }
  };

  const handleRemoveTask = async (taskId) => {
    try {
      await apiCycles(token).removeTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      console.error('Error removing task from cycle:', e);
    }
  };

  const handleActivate = async () => {
    try {
      const res = await apiCycles(token).activate(workspaceId, cycleId);
      setCycle(res.cycle || res);
    } catch (e) {
      console.error('Error activating cycle:', e);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('¿Completar este ciclo? Las tareas no completadas quedarán en backlog.')) return;
    try {
      const res = await apiCycles(token).complete(workspaceId, cycleId);
      setCycle(res.cycle || res);
    } catch (e) {
      console.error('Error completing cycle:', e);
    }
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    try {
      const updated = await apiCycles(token).update(workspaceId, cycleId, { nombre: nameDraft.trim() });
      setCycle(updated);
      setEditName(false);
    } catch (e) {
      console.error('Error updating cycle name:', e);
    }
  };

  const completedTasks = tasks.filter((t) => t.estado === 'completada' || t.estado === 'Completada').length;
  const totalTasks = tasks.length;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-CL', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch { return '—'; }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Ciclo no encontrado</p>
        <button
          onClick={() => navigate(`/workspace/${workspaceId}/cycles`)}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← Volver a ciclos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(`/workspace/${workspaceId}/cycles`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a ciclos
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
                onClick={() => { setEditName(true); setNameDraft(cycle.nombre); }}
                title="Editar nombre"
              >
                {cycle.nombre}
              </h1>
            )}
            {cycle.descripcion && (
              <p className="text-gray-500 mt-1">{cycle.descripcion}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <CycleStatusBadge status={cycle.status} />
              <span>{formatDate(cycle.start_date)} → {formatDate(cycle.end_date)}</span>
              <span>{totalTasks} tareas</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {cycle.status === 'draft' && (
              <button
                onClick={handleActivate}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Activar ciclo
              </button>
            )}
            {cycle.status === 'active' && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Completar ciclo
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <CycleProgressBar completed={completedTasks} total={totalTasks} size="lg" />
        </div>
      </div>

      {/* Tasks list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tareas · {totalTasks}
        </h2>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Este ciclo no tiene tareas aún
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
                  title="Remover del ciclo"
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

export default CycleDetail;
