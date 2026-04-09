/// notifications.rs — Comandos para notificaciones nativas y alarmas programadas
/// Similar a Notion: recordatorios por tarea, deadline alerts, daily digest

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

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
/// Persiste en SQLite — el sync worker lo dispara cuando llega la hora.
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
pub async fn schedule_task_reminder(
    app: AppHandle,
    reminder: ReminderRequest,
) -> Result<String, String> {
    // Validar que fire_at sea una fecha futura
    let fire_at = reminder
        .fire_at
        .parse::<DateTime<Utc>>()
        .map_err(|e| format!("Fecha inválida: {}", e))?;

    if fire_at <= Utc::now() {
        return Err("La fecha de disparo debe ser en el futuro".to_string());
    }

    let db_path = get_db_path(&app)?;
    let reminder_id = reminder.id.clone();
    let created_at = Utc::now().to_rfc3339();

    // Persistir en SQLite
    tokio::task::spawn_blocking(move || {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("SQLite open: {}", e))?;

        conn.execute(
            "INSERT OR REPLACE INTO pending_notifications
             (id, task_id, title, body, fire_at, fired, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6)",
            rusqlite::params![
                reminder.id,
                reminder.task_id,
                reminder.title,
                reminder.body,
                reminder.fire_at,
                created_at,
            ],
        )
        .map_err(|e| format!("SQLite insert: {}", e))?;

        log::info!(
            "📅 Recordatorio guardado: id={} fire_at={}",
            reminder.id,
            reminder.fire_at
        );
        Ok::<_, String>(())
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    Ok(reminder_id)
}

/// Cancela un recordatorio programado por su ID
#[tauri::command]
pub async fn cancel_reminder(app: AppHandle, reminder_id: String) -> Result<(), String> {
    let db_path = get_db_path(&app)?;

    tokio::task::spawn_blocking(move || {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("SQLite open: {}", e))?;

        conn.execute(
            "UPDATE pending_notifications SET fired = -1 WHERE id = ?1",
            [&reminder_id],
        )
        .map_err(|e| format!("SQLite update: {}", e))?;

        log::info!("🗑️ Recordatorio cancelado: id={}", reminder_id);
        Ok::<_, String>(())
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    Ok(())
}

/// Lista las notificaciones pendientes (no disparadas ni canceladas)
#[tauri::command]
pub async fn get_pending_notifications(
    app: AppHandle,
) -> Result<Vec<PendingNotification>, String> {
    let db_path = get_db_path(&app)?;

    if !db_path.exists() {
        return Ok(vec![]);
    }

    let now_str = Utc::now().to_rfc3339();

    let notifs = tokio::task::spawn_blocking(move || {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("SQLite open: {}", e))?;

        let mut stmt = conn
            .prepare(
                "SELECT id, task_id, title, body, fire_at
                 FROM pending_notifications
                 WHERE fired = 0 AND fire_at > ?1
                 ORDER BY fire_at ASC",
            )
            .map_err(|e| e.to_string())?;

        let result: Vec<PendingNotification> = stmt
            .query_map([&now_str], |row| {
                Ok(PendingNotification {
                    id: row.get(0)?,
                    task_id: row.get(1)?,
                    title: row.get(2)?,
                    body: row.get(3)?,
                    fire_at: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok::<_, String>(result)
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    Ok(notifs)
}

// ─────────────────────────────────────────────
//  HELPERS (uso interno desde el worker)
// ─────────────────────────────────────────────

/// Envía una notificación nativa inmediata al OS/Android
/// Llamado desde el sync worker cuando llega la hora
pub fn fire_native_notification(
    app: &AppHandle,
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

    log::info!("🔔 Notificación enviada: title={}", title);
    Ok(())
}

fn get_db_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo obtener app_data_dir: {}", e))?;

    Ok(data_dir.join("docktask.db"))
}
