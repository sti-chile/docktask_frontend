import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  RectangleGroupIcon,
  ArrowPathIcon,
  Square2StackIcon,
  FolderIcon,
} from '@heroicons/react/24/outline/index.js';
import { useWorkspaceQuery } from '../hooks/useWorkspaceQuery';
import { useProjectQuery } from '../hooks/useProjectQuery';

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();

  // Resolve active workspace from query param OR path param
  const qsId = searchParams.get('workspace_id');
  const pathId = params.workspaceId;
  const activeId = qsId ? parseInt(qsId) : pathId ? parseInt(pathId) : null;

  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState(activeId);
  const { workspaces = [] } = useWorkspaceQuery(token);

  const handleToggleWorkspace = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      navigate(`/mis-proyectos?workspace_id=${id}`);
    }
  };

  return (
    <aside
      className={`flex flex-col flex-shrink-0 h-full border-r border-gray-100 bg-white transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-56'
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
          const isExpanded = ws.id === expandedId;
          const isActive = ws.id === activeId;

          return (
            <div key={ws.id}>
              {/* Workspace row */}
              <button
                onClick={() => handleToggleWorkspace(ws.id)}
                title={collapsed ? ws.nombre : undefined}
                className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-left transition-colors group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {/* Avatar: emoji if available, letter fallback */}
                <span
                  className={`flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold ${
                    ws.icono ? '' : color
                  }`}
                >
                  {ws.icono || (ws.nombre || '?')[0].toUpperCase()}
                </span>

                {!collapsed && (
                  <>
                    <span className="text-sm font-medium truncate leading-tight flex-1">
                      {ws.nombre}
                    </span>
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Expanded sub-menu */}
              {isExpanded && !collapsed && (
                <WorkspaceSubMenu wsId={ws.id} token={token} navigate={navigate} location={location} />
              )}
            </div>
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

/** Sub-menu that appears when a workspace is expanded */
function WorkspaceSubMenu({ wsId, token, navigate, location }) {
  const { proyectos = [], isLoading } = useProjectQuery(token, wsId);

  const subItemClass = (active) =>
    `w-full flex items-center gap-2 pl-8 pr-2 py-1 rounded-md text-left text-xs transition-colors ${
      active
        ? 'bg-indigo-50 text-indigo-700 font-medium'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
    }`;

  const isPathActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="mt-0.5 mb-1 space-y-px">
      {/* Proyectos section */}
      {isLoading ? (
        <div className="pl-8 pr-2 py-1">
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        proyectos.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/mis-proyectos/${p.id}/tareas?workspace_id=${wsId}`)}
            className={subItemClass(
              location.pathname === `/mis-proyectos/${p.id}/tareas`
            )}
          >
            <FolderIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{p.nombre}</span>
          </button>
        ))
      )}

      {!isLoading && proyectos.length === 0 && (
        <p className="pl-8 pr-2 py-1 text-[11px] text-gray-400">Sin proyectos</p>
      )}

      {/* Divider */}
      <div className="mx-6 my-1 border-t border-gray-100" />

      {/* Ciclos */}
      <button
        onClick={() => navigate(`/workspace/${wsId}/cycles`)}
        className={subItemClass(isPathActive(`/workspace/${wsId}/cycles`))}
      >
        <ArrowPathIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Ciclos</span>
      </button>

      {/* Módulos */}
      <button
        onClick={() => navigate(`/workspace/${wsId}/modules`)}
        className={subItemClass(isPathActive(`/workspace/${wsId}/modules`))}
      >
        <Square2StackIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Módulos</span>
      </button>
    </div>
  );
}

export default WorkspaceSidebar;
