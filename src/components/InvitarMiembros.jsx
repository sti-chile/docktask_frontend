import React, { useState, useEffect, useRef } from 'react';
import { UserPlusIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline/index.js';
import { useInvitacionesQuery } from '../hooks/useInvitacionesQuery';

const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const InvitarMiembros = ({ workspaceId, token }) => {
  const api = useInvitacionesQuery(token);
  // Guardamos las funciones en refs para no tenerlas en deps de useEffect
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; });

  const [query, setQuery] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cargar miembros actuales — solo depende de workspaceId y token (valores estables)
  useEffect(() => {
    let cancelled = false;
    apiRef.current.getMiembrosWorkspace(workspaceId)
      .then((data) => { if (!cancelled) setMiembros(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setMiembros([]); });
    return () => { cancelled = true; };
  }, [workspaceId, token]);

  // Buscar usuarios con debounce
  useEffect(() => {
    if (query.length < 2) { setSugerencias([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await apiRef.current.buscarUsuarios(query);
        setSugerencias(
          (Array.isArray(data) ? data : []).filter(
            (u) => !miembros.some((m) => m.usuario_id === u.id)
          )
        );
      } catch {
        setSugerencias([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, miembros]);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setSugerencias([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mostrarFeedback = (tipo, texto) => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 3000);
  };

  const recargarMiembros = () => {
    apiRef.current.getMiembrosWorkspace(workspaceId)
      .then((data) => setMiembros(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const invitar = async ({ destinatario_id, email }) => {
    setEnviando(true);
    try {
      await apiRef.current.crearInvitacion({
        tipo: 'workspace',
        destino_id: workspaceId,
        ...(destinatario_id ? { destinatario_id } : { email }),
      });
      mostrarFeedback('exito', email ? `Invitación enviada a ${email}` : 'Invitación enviada');
      setQuery('');
      setSugerencias([]);
    } catch (e) {
      const msg = e.response?.data?.error || 'Error al enviar invitación';
      mostrarFeedback('error', msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isEmail(query)) {
      e.preventDefault();
      invitar({ email: query });
    }
    if (e.key === 'Escape') {
      setSugerencias([]);
      setQuery('');
    }
  };

  const handleEliminarMiembro = async (usuarioId) => {
    try {
      await apiRef.current.eliminarMiembro(workspaceId, usuarioId);
      mostrarFeedback('info', 'Miembro eliminado');
      recargarMiembros();
    } catch {
      mostrarFeedback('error', 'Error al eliminar miembro');
    }
  };

  const mostrarInvitarPorEmail = query.length >= 4 && isEmail(query) && sugerencias.length === 0;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Invitar miembros
      </label>

      <div className="relative">
        <div className="flex items-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <UserPlusIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, usuario o correo..."
            className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSugerencias([]); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {(sugerencias.length > 0 || mostrarInvitarPorEmail) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {sugerencias.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => invitar({ destinatario_id: u.id })}
                disabled={enviando}
                className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors flex items-center gap-3"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                  {(u.nombre || u.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.nombre || u.username}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </button>
            ))}

            {mostrarInvitarPorEmail && (
              <button
                type="button"
                onClick={() => invitar({ email: query })}
                disabled={enviando}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center gap-3 border-t border-gray-100"
              >
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserPlusIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Invitar por correo</p>
                  <p className="text-xs text-gray-500">{query}</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Escribí un nombre o usuario para buscar, o ingresá un correo y presioná Enter para invitar.
      </p>

      {feedback && (
        <div className={`text-sm px-3 py-2 rounded-md ${
          feedback.tipo === 'exito' ? 'bg-green-50 text-green-700' :
          feedback.tipo === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {feedback.texto}
        </div>
      )}

      {miembros.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Miembros actuales
            </span>
          </div>
          <div className="space-y-1">
            {miembros.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                    {(m.nombre || m.username || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{m.nombre || m.username}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    m.rol === 'owner'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {m.rol}
                  </span>
                </div>
                {m.rol !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => handleEliminarMiembro(m.usuario_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar miembro"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitarMiembros;
