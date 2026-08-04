/**
 * tauri/index.js — Bridge React ↔ Rust
 *
 * Centraliza todas las llamadas a comandos Rust de Tauri.
 * Si la app corre en el browser (sin Tauri), usa fallbacks HTTP.
 */

// Detectar si estamos dentro de Tauri
export const IS_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window

// Lazy import para no romper en el browser
const getInvoke = async () => {
    if (!IS_TAURI) return null
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke
}

const getEmitter = async () => {
    if (!IS_TAURI) return null
    const { listen } = await import("@tauri-apps/api/event")
    return listen
}

// ─────────────────────────────────────────────
//  OFFLINE / BASE DE DATOS LOCAL
// ─────────────────────────────────────────────

/**
 * Guarda una tarea en SQLite local (offline-first)
 * @param {Object} task - Objeto tarea con todos sus campos
 */
export async function saveTaskOffline(task) {
    const invoke = await getInvoke()
    if (!invoke) return // En browser no hace nada
    return invoke("save_task_offline", { task })
}

/**
 * Guarda un proyecto en SQLite local
 * @param {Object} project
 */
export async function saveProjectOffline(project) {
    const invoke = await getInvoke()
    if (!invoke) return
    return invoke("save_project_offline", { project })
}

/**
 * Retorna los IDs con pendiente de sincronización
 * @returns {Promise<string[]>}
 */
export async function getPendingSync() {
    const invoke = await getInvoke()
    if (!invoke) return []
    return invoke("get_pending_sync")
}

// ─────────────────────────────────────────────
//  NOTIFICACIONES Y ALARMAS
// ─────────────────────────────────────────────

/**
 * Programa un recordatorio para una tarea
 * @param {{ id, task_id, title, body, fire_at, repeat }} reminder
 * @returns {Promise<string>} ID del recordatorio creado
 *
 * @example
 * await scheduleTaskReminder({
 *   id: `rem-${task.id}`,
 *   task_id: task.id,
 *   title: 'DockTask ⏰',
 *   body: `"${task.title}" vence en 1 hora`,
 *   fire_at: new Date(task.end_date - 3600000).toISOString(),
 *   repeat: null
 * });
 */
export async function scheduleTaskReminder(reminder) {
    const invoke = await getInvoke()
    if (!invoke) {
        console.warn("[Tauri] scheduleTaskReminder: no disponible en browser")
        return null
    }
    return invoke("schedule_task_reminder", { reminder })
}

/**
 * Cancela un recordatorio por ID
 * @param {string} reminderId
 */
export async function cancelReminder(reminderId) {
    const invoke = await getInvoke()
    if (!invoke) return
    return invoke("cancel_reminder", { reminder_id: reminderId })
}

/**
 * Lista las notificaciones pendientes
 * @returns {Promise<Array>}
 */
export async function getPendingNotifications() {
    const invoke = await getInvoke()
    if (!invoke) return []
    return invoke("get_pending_notifications")
}

// ─────────────────────────────────────────────
//  CALENDARIO
// ─────────────────────────────────────────────

/**
 * Agrega una tarea al calendario del sistema operativo
 * @param {{ id, title, description, start_date, end_date, all_day, location }} event
 * @returns {Promise<string>} Contenido ICS (para fallback de descarga)
 */
export async function addToOsCalendar(event) {
    const invoke = await getInvoke()
    if (!invoke) return null
    return invoke("add_to_os_calendar", { event })
}

/**
 * Elimina un evento del calendario del OS
 * @param {string} eventId
 */
export async function removeFromOsCalendar(eventId) {
    const invoke = await getInvoke()
    if (!invoke) return
    return invoke("remove_from_os_calendar", { event_id: eventId })
}

// ─────────────────────────────────────────────
//  SISTEMA
// ─────────────────────────────────────────────

/**
 * Verifica si hay conexión a internet
 * @returns {Promise<boolean>}
 */
export async function getNetworkStatus() {
    const invoke = await getInvoke()
    if (!invoke) return navigator.onLine
    return invoke("get_network_status")
}

// ─────────────────────────────────────────────
//  EVENTOS (Rust → React)
// ─────────────────────────────────────────────

/**
 * Escuchar evento de sync completado desde Rust
 * @param {(count: number) => void} callback
 * @returns {Promise<() => void>} unlisten
 *
 * @example
 * const unlisten = await onSyncCompleted((count) => {
 *   queryClient.invalidateQueries(['tasks']);
 *   toast.success(`${count} cambios sincronizados`);
 * });
 *
 * // En el cleanup del useEffect:
 * return () => unlisten();
 */
export async function onSyncCompleted(callback) {
    const listen = await getEmitter()
    if (!listen) return () => {}
    return listen("sync:completed", (event) => callback(event.payload))
}
