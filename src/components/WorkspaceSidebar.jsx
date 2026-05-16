import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline/index.js';
import { useWorkspaceQuery } from '../hooks/useWorkspaceQuery';

// Colores para los avatares de workspace (por índice)
const COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const WorkspaceSidebar = ({ token }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('workspace_id')
    ? parseInt(searchParams.get('workspace_id'))
    : null;

  const [collapsed, setCollapsed] = useState(false);
  const { workspaces = [] } = useWorkspaceQuery(token);

  const handleSelect = (id) => {
    navigate(`/mis-proyectos?workspace_id=${id}`);
  };

  return (
    <aside
      className={`flex flex-col flex-shrink-0 h-full border-r border-gray-100 bg-white transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-52'
      }`}
    >
      {/* Toggle */}
      <div className="flex items-center justify-end px-2 py-3 border-b border-gray-100">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Label */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Workspaces
          </span>
        </div>
      )}

      {/* Lista */}
      <nav className="flex-1 overflow-y-auto py-1 px-1.5 space-y-0.5">
        {workspaces.map((ws, i) => {
          const color = COLORS[i % COLORS.length];
          const isActive = ws.id === activeId;
          const inicial = (ws.nombre || '?')[0].toUpperCase();

          return (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              title={collapsed ? ws.nombre : undefined}
              className={`w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md text-left transition-colors group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {/* Avatar */}
              <span
                className={`flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold ${color}`}
              >
                {inicial}
              </span>

              {/* Nombre */}
              {!collapsed && (
                <span className="text-sm font-medium truncate leading-tight">
                  {ws.nombre}
                </span>
              )}
            </button>
          );
        })}

        {workspaces.length === 0 && !collapsed && (
          <p className="text-xs text-gray-400 px-2 py-3">Sin workspaces</p>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-1.5 space-y-0.5">
        <button
          onClick={() => navigate('/crear-workspace')}
          title="Crear workspace"
          className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <PlusIcon className="flex-shrink-0 h-4 w-4" />
          {!collapsed && <span className="text-sm">Nuevo workspace</span>}
        </button>

        <button
          onClick={() => navigate('/mis-workspaces')}
          title="Ver todos"
          className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <RectangleGroupIcon className="flex-shrink-0 h-4 w-4" />
          {!collapsed && <span className="text-sm">Ver todos</span>}
        </button>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
