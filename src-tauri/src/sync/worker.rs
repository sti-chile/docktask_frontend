/// worker.rs — Sync worker y Notification worker
/// Corre en threads separados, independiente de la UI.
///
/// Responsabilidades:
/// 1. Cada 30s: buscar registros con synced=false y subirlos al backend
/// 2. Cada 60s: buscar notificaciones con fire_at <= now() y dispararlas
/// 3. Detectar cambios de conectividad y sincronizar inmediatamente al volver la red

use std::time::Duration;
use tauri::AppHandle;
use tokio::time;

// Intervalo de sincronización de datos
const SYNC_INTERVAL_SECS: u64 = 30;
// Intervalo de revisión de notificaciones pendientes
const NOTIF_CHECK_INTERVAL_SECS: u64 = 60;
// URL del backend (se puede configurar desde tauri-plugin-store)
const BACKEND_URL: &str = "http://localhost:8000/api/v1";

/// Punto de entrada del worker — llamado desde lib.rs setup
pub async fn start_sync_loop(app: AppHandle) {
    log::info!("🦀 DockTask Sync Worker iniciado");

    // Lanzar los dos loops en paralelo
    let app_sync = app.clone();
    let app_notif = app.clone();

    tokio::join!(
        run_data_sync_loop(app_sync),
        run_notification_loop(app_notif),
    );
}

// ─────────────────────────────────────────────
//  LOOP DE SINCRONIZACIÓN DE DATOS
// ─────────────────────────────────────────────

async fn run_data_sync_loop(app: AppHandle) {
    let mut interval = time::interval(Duration::from_secs(SYNC_INTERVAL_SECS));

    loop {
        interval.tick().await;

        match sync_pending_changes(&app).await {
            Ok(count) if count > 0 => {
                log::info!("Sync: {} cambios subidos al backend", count);
                // Emitir evento a la UI para que React Query invalide el cache
                let _ = app.emit("sync:completed", count);
            }
            Ok(_) => {
                log::debug!("Sync: nada pendiente");
            }
            Err(e) => {
                log::warn!("Sync error: {}", e);
            }
        }
    }
}

async fn sync_pending_changes(app: &AppHandle) -> Result<usize, String> {
    // Verificar conectividad primero
    if !is_online().await {
        return Ok(0);
    }

    // TODO: Leer registros con synced=0 de SQLite
    // Por ahora retorna 0 (sin cambios)
    // Implementación completa:
    // 1. db.query("SELECT * FROM tasks WHERE synced=0")
    // 2. Para cada tarea: POST/PATCH al backend
    // 3. Si OK: UPDATE tasks SET synced=1 WHERE id=?
    // 4. Manejar conflictos con Last-Write-Wins (updated_at)

    Ok(0)
}

// ─────────────────────────────────────────────
//  LOOP DE NOTIFICACIONES
// ─────────────────────────────────────────────

async fn run_notification_loop(app: AppHandle) {
    let mut interval = time::interval(Duration::from_secs(NOTIF_CHECK_INTERVAL_SECS));

    loop {
        interval.tick().await;

        match check_and_fire_notifications(&app).await {
            Ok(count) if count > 0 => {
                log::info!("{} notificaciones disparadas", count);
            }
            Ok(_) => {}
            Err(e) => {
                log::warn!("Error al disparar notificaciones: {}", e);
            }
        }
    }
}

async fn check_and_fire_notifications(app: &AppHandle) -> Result<usize, String> {
    let now = chrono::Utc::now();

    // TODO: Leer pending_notifications WHERE fired=0 AND fire_at <= now
    // Para cada una:
    // 1. Disparar con fire_native_notification()
    // 2. Marcar fired=1 en SQLite

    // Ejemplo de uso:
    // crate::commands::notifications::fire_native_notification(
    //     app,
    //     "DockTask ⏰",
    //     "La tarea 'Diseño Gantt' vence en 1 hora"
    // )?;

    let _ = now; // suprimir warning hasta implementación completa
    let _ = app;
    Ok(0)
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

async fn is_online() -> bool {
    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
    {
        Ok(c) => c,
        Err(_) => return false,
    };

    client.get("https://1.1.1.1").send().await.is_ok()
}
