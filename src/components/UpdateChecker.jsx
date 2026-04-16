import React, { useEffect, useState } from 'react';
import { useTauri } from '../hooks/useTauri';

/**
 * UpdateChecker — Verifica y aplica actualizaciones automáticas (solo desktop)
 *
 * Comportamiento:
 * - Al montar: verifica si hay update disponible (silencioso)
 * - Si hay update: muestra banner no intrusivo con opción de instalar
 * - Al confirmar: descarga e instala (reinicia la app automáticamente)
 */
const UpdateChecker = () => {
  const { isTauri, isDesktop } = useTauri();
  const [update, setUpdate] = useState(null);     // { version, body }
  const [status, setStatus] = useState('idle');   // 'idle' | 'checking' | 'downloading' | 'done'
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Solo en Tauri desktop
    if (!isTauri || !isDesktop) return;

    // Esperar 5s para no bloquear el startup
    const timer = setTimeout(checkForUpdate, 5000);
    return () => clearTimeout(timer);
  }, [isTauri, isDesktop]);

  const checkForUpdate = async () => {
    try {
      setStatus('checking');
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();

      if (result?.available) {
        setUpdate({ version: result.version, body: result.body });
        setStatus('available');
      } else {
        setStatus('idle');
      }
    } catch (e) {
      // Silencioso — update es opcional
      console.warn('[UpdateChecker] Error al verificar:', e);
      setStatus('idle');
    }
  };

  const installUpdate = async () => {
    if (!update) return;
    try {
      setStatus('downloading');
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      if (result?.available) {
        await result.downloadAndInstall();
        // La app se reinicia automáticamente
      }
    } catch (e) {
      console.error('[UpdateChecker] Error al instalar:', e);
      setStatus('available');
    }
  };

  // No mostrar nada si no hay update o fue descartado
  if (!update || dismissed || status === 'idle' || status === 'checking') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '16px 20px',
        maxWidth: 340,
        border: '1px solid #e2e8f0',
        animation: 'slide-in-right 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <strong style={{ fontSize: 14, color: '#1e293b' }}>
            Actualización disponible
          </strong>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: 2,
          }}
        >
          ×
        </button>
      </div>

      {/* Versión */}
      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#475569' }}>
        Versión <strong>{update.version}</strong> está disponible
      </p>
      {update.body && (
        <p style={{
          margin: '0 0 12px', fontSize: 12, color: '#64748b',
          maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {update.body}
        </p>
      )}

      {/* Botones */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', background: 'white',
            color: '#64748b', fontSize: 13, cursor: 'pointer',
          }}
        >
          Más tarde
        </button>
        <button
          onClick={installUpdate}
          disabled={status === 'downloading'}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: 'none', background: 'hsl(var(--primary))',
            color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: status === 'downloading' ? 0.7 : 1,
          }}
        >
          {status === 'downloading' ? '⏳ Instalando...' : 'Instalar ahora'}
        </button>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UpdateChecker;
