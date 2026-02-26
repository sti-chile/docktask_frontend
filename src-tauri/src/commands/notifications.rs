/// notifications.rs — Comandos para notificaciones nativas y alarmas programadas
/// Similar a Notion: recordatorios por tarea, deadline alerts, daily digest

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// ─────────────────────────────────────────────
//  MODELOS
// ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ReminderRequest {
    /// ID único del recordatorio
    pub id: String,
    /// ID de la tarea asociada
    pub task_id: String,
    /// Título de la notificación
    pub title: String,
    /// Cuerpo del mensaje
    pub body: String,
    /// Cuándo disparar (ISO 8601 UTC)
    pub fire_at: String,
    /// Repetir: "none" | "daily" | "weekly"
    pub repeat: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PendingNotification {
    pub id: String,
    pub task_id: Option<String>,
    pub title: String,
    pub body: String,
    pub fire_at: String,
}

// ─────────────────────────────────────────────
//  COMANDOS
// ─────────────────────────────────────────────

/// Programa un recordatorio para una tarea.
/// El frontend llama: invoke("schedule_task_reminder", { reminder: { ... } })
///
/// Ejemplo de uso desde JS:
/// ```js
/// await invoke("schedule_task_reminder", {
///   reminder: {
///     id: "rem-123",
///     task_id: "task-456",
///     title: "DockTask ⏰",
///     body: "La tarea 'Diseño Gantt' vence en 1 hora",
///     fire_at: "2026-03-01T14:00:00Z",
///     repeat: null
///   }
/// });
/// ```
#[tauri::command]
pub async fn schedule_task_reminder(reminder: ReminderRequest) -> Result<String, String> {
    // Validar que fire_at sea una fecha futura
    let fire_at = reminder
        .fire_at
        .parse::<DateTime<Utc>>()
        .map_err(|e| format!("Fecha inválida: {}", e))?;

    if fire_at <= Utc::now() {
        return Err("La fecha de disparo debe ser en el futuro".to_string());
    }

    log::info!(
        "Recordatorio programado: id={} task_id={} fire_at={}",
        reminder.id,
        reminder.task_id,
        reminder.fire_at
    );

    // TODO: Insertar en pending_notifications (SQLite)
    // La notificación será disparada por el NotificationWorker (sync/worker.rs)

    Ok(reminder.id)
}

/// Cancela un recordatorio programado por su ID
#[tauri::command]
pub async fn cancel_reminder(reminder_id: String) -> Result<(), String> {
    log::info!("Cancelar recordatorio: id={}", reminder_id);
    // TODO: Marcar como cancelado en SQLite (fired=-1)
    Ok(())
}

/// Lista las notificaciones pendientes (no disparadas)
#[tauri::command]
pub async fn get_pending_notifications() -> Result<Vec<PendingNotification>, String> {
    // TODO: Leer desde SQLite pending_notifications WHERE fired=0 AND fire_at > now()
    Ok(vec![])
}

// ─────────────────────────────────────────────
//  HELPERS (uso interno desde el worker)
// ─────────────────────────────────────────────

/// Envía una notificación nativa inmediata al OS
/// Llamado desde el sync worker cuando llega la hora
pub fn fire_native_notification(
    app: &tauri::AppHandle,
    title: &str,
    body: &str,
) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("Error al enviar notificación: {}", e))?;

    log::info!("Notificación enviada: title={}", title);
    Ok(())
}
