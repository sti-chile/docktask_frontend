/**
 * useTauri.js — Integración React ↔ Tauri
 *
 * Detecta si la app corre dentro de Tauri (desktop/Android) o en el browser (web).
 * Expone helpers para invocar comandos nativos de forma segura.
 *
 * Uso:
 *   const { isTauri, platform, invoke, scheduleReminder } = useTauri();
 */

import { useState, useEffect, useCallback } from "react";

// Tauri v2: los módulos se importan desde @tauri-apps/api
let tauriInvoke = null;
let tauriPlatform = null;
let tauriListen = null;

// Importación dinámica para no romper la app cuando corre en el browser
(async () => {
  if (typeof window !== "undefined" && window.__TAURI__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const { platform } = await import("@tauri-apps/plugin-os");
      const { listen } = await import("@tauri-apps/api/event");
      tauriInvoke = invoke;
      tauriPlatform = platform;
      tauriListen = listen;
    } catch (e) {
      console.warn("[useTauri] No se pudo cargar Tauri API:", e);
    }
  }
})();

// ─────────────────────────────────────────────
//  HOOK PRINCIPAL
// ─────────────────────────────────────────────

export function useTauri() {
  const isTauri = typeof window !== "undefined" && !!window.__TAURI__;
  const [platform, setPlatform] = useState(null); // "android" | "linux" | "windows" | "macos" | null (web)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!isTauri) return;

    // Detectar plataforma
    (async () => {
      try {
        if (tauriPlatform) {
          const p = await tauriPlatform();
          setPlatform(p);
        }
      } catch (e) {
        console.warn("[useTauri] Error al detectar plataforma:", e);
      }
    })();

    // Escuchar eventos de sync completado
    let unlisten;
    if (tauriListen) {
      tauriListen("sync:completed", (event) => {
        console.log(`[DockTask Sync] ${event.payload} cambios sincronizados`);
        // Emitir evento custom para que los hooks de React Query invaliden
        window.dispatchEvent(new CustomEvent("docktask:synced", { detail: event.payload }));
      }).then((fn) => {
        unlisten = fn;
      });
    }

    return () => {
      if (unlisten) unlisten();
    };
  }, [isTauri]);

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Helpers de plataforma ──

  const isMobile = platform === "android" || platform === "ios";
  const isDesktop = platform === "linux" || platform === "windows" || platform === "macos";

  // ── invoke seguro ──

  const invoke = useCallback(async (command, args = {}) => {
    if (!isTauri || !tauriInvoke) {
      throw new Error(`Comando Tauri no disponible en el browser: ${command}`);
    }
    return tauriInvoke(command, args);
  }, [isTauri]);

  // ── Helpers de alto nivel ──

  /**
   * Programa un recordatorio para una tarea.
   * @param {string} taskId
   * @param {string} title
   * @param {string} body
   * @param {Date} fireAt
   */
  const scheduleReminder = useCallback(
    async (taskId, title, body, fireAt) => {
      if (!isTauri) return null;

      const reminderId = `rem-${taskId}-${Date.now()}`;
      return invoke("schedule_task_reminder", {
        reminder: {
          id: reminderId,
          task_id: taskId,
          title,
          body,
          fire_at: fireAt.toISOString(),
          repeat: null,
        },
      });
    },
    [isTauri, invoke]
  );

  /**
   * Cancela un recordatorio por ID.
   */
  const cancelReminder = useCallback(
    async (reminderId) => {
      if (!isTauri) return;
      return invoke("cancel_reminder", { reminder_id: reminderId });
    },
    [isTauri, invoke]
  );

  /**
   * Lista los recordatorios pendientes.
   */
  const getPendingReminders = useCallback(async () => {
    if (!isTauri) return [];
    return invoke("get_pending_notifications");
  }, [isTauri, invoke]);

  /**
   * Verifica si hay conexión a internet (via Rust).
   */
  const checkNetwork = useCallback(async () => {
    if (!isTauri) return navigator.onLine;
    return invoke("get_network_status");
  }, [isTauri, invoke]);

  /**
   * Agrega una tarea al calendario del OS.
   */
  const addToCalendar = useCallback(
    async (event) => {
      if (!isTauri) return null;
      return invoke("add_to_os_calendar", { event });
    },
    [isTauri, invoke]
  );

  return {
    isTauri,
    platform,
    isMobile,
    isDesktop,
    isOnline,
    invoke,
    scheduleReminder,
    cancelReminder,
    getPendingReminders,
    checkNetwork,
    addToCalendar,
  };
}

// ─────────────────────────────────────────────
//  HELPER: guardar token en Tauri Store
//  (para que el sync worker lo pueda leer)
// ─────────────────────────────────────────────

export async function saveTauriAuthToken(token) {
  if (typeof window === "undefined" || !window.__TAURI__) return;
  try {
    const { load } = await import("@tauri-apps/plugin-store");
    const store = await load("auth.json", { autoSave: true });
    await store.set("token", token);
    await store.save();
  } catch (e) {
    console.warn("[useTauri] No se pudo guardar token en store:", e);
  }
}

export async function clearTauriAuthToken() {
  if (typeof window === "undefined" || !window.__TAURI__) return;
  try {
    const { load } = await import("@tauri-apps/plugin-store");
    const store = await load("auth.json", { autoSave: true });
    await store.delete("token");
    await store.save();
  } catch (e) {
    console.warn("[useTauri] No se pudo limpiar token del store:", e);
  }
}
