/// worker.rs — Sync worker y Notification worker
/// Corre en threads separados, independiente de la UI.
///
/// Responsabilidades:
/// 1. Cada 30s: buscar registros con synced=false y subirlos al backend
/// 2. Cada 60s: buscar notificaciones con fire_at <= now() y dispararlas
/// 3. Detectar cambios de conectividad y sincronizar inmediatamente al volver la red

use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tokio::time;

// Intervalo de sincronización de datos
const SYNC_INTERVAL_SECS: u64 = 30;
// Intervalo de revisión de notificaciones pendientes
const NOTIF_CHECK_INTERVAL_SECS: u64 = 60;
// URL base del backend de producción
const BACKEND_URL: &str = "https://api.docktask.com/api/v1";

// ─────────────────────────────────────────────
//  MODELOS PARA SYNC
// ─────────────────────────────────────────────

#[derive(Debug, serde::Serialize)]
struct TaskSyncPayload {
    id: String,
    project_id: String,
    title: String,
    description: Option<String>,
    status: String,
    priority: String,
    start_date: Option<String>,
    end_date: Option<String>,
    assigned_to: Option<String>,
    updated_at: String,
}

#[derive(Debug, serde::Serialize)]
struct ProjectSyncPayload {
    id: String,
    name: String,
    description: Option<String>,
    updated_at: String,
}

// ─────────────────────────────────────────────
//  PUNTO DE ENTRADA
// ─────────────────────────────────────────────

/// Punto de entrada del worker — llamado desde lib.rs setup
pub async fn start_sync_loop(app: AppHandle) {
    log::info!("🦀 DockTask Sync Worker iniciado — backend: {}", BACKEND_URL);

    let app_sync = app.clone();
    let app_notif = app.clone();

    tokio::join!(
        run_data_sync_loop(app_sync),
        run_notification_loop(app_notif),
    );
}

// ─────────────────────────────────────────────
//  HELPERS: RUTA DE LA DB
// ─────────────────────────────────────────────

/// Retorna la ruta al archivo SQLite de la app.
/// tauri-plugin-sql guarda la DB en: <app_data_dir>/docktask.db
fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo obtener app_data_dir: {}", e))?;

    Ok(data_dir.join("docktask.db"))
}

// ─────────────────────────────────────────────
//  LOOP DE SINCRONIZACIÓN DE DATOS
// ─────────────────────────────────────────────

async fn run_data_sync_loop(app: AppHandle) {
    // Esperar un poco al inicio para que la DB esté lista
    time::sleep(Duration::from_secs(5)).await;

    let mut interval = time::interval(Duration::from_secs(SYNC_INTERVAL_SECS));

    loop {
        interval.tick().await;

        match sync_pending_changes(&app).await {
            Ok(count) if count > 0 => {
                log::info!("✅ Sync: {} cambios subidos al backend", count);
                // Notificar a la UI para que React Query invalide el cache
                let _ = app.emit("sync:completed", count);
            }
            Ok(_) => {
                log::debug!("Sync: nada pendiente");
            }
            Err(e) => {
                log::warn!("⚠️  Sync error: {}", e);
            }
        }
    }
}

async fn sync_pending_changes(app: &AppHandle) -> Result<usize, String> {
    // Verificar conectividad primero
    if !is_online().await {
        log::debug!("Sync: sin conexión, saltando");
        return Ok(0);
    }

    // Obtener token JWT del store
    let token = get_auth_token(app).await?;
    if token.is_empty() {
        log::debug!("Sync: sin token de sesión, saltando");
        return Ok(0);
    }

    let db_path = get_db_path(app)?;
    if !db_path.exists() {
        return Ok(0);
    }

    // Leer registros pendientes desde SQLite
    let (pending_tasks, pending_projects) =
        tokio::task::spawn_blocking(move || read_pending_records(&db_path))
            .await
            .map_err(|e| format!("Error en hilo SQLite: {}", e))??;

    let mut synced_count = 0usize;

    // Subir tareas pendientes
    for task in pending_tasks {
        match push_task_to_backend(&task, &token).await {
            Ok(_) => {
                mark_task_synced(&app, &task.id).await?;
                synced_count += 1;
                log::info!("  Tarea sincronizada: {}", task.id);
            }
            Err(e) => log::warn!("  Error sync tarea {}: {}", task.id, e),
        }
    }

    // Subir proyectos pendientes
    for project in pending_projects {
        match push_project_to_backend(&project, &token).await {
            Ok(_) => {
                mark_project_synced(&app, &project.id).await?;
                synced_count += 1;
                log::info!("  Proyecto sincronizado: {}", project.id);
            }
            Err(e) => log::warn!("  Error sync proyecto {}: {}", project.id, e),
        }
    }

    Ok(synced_count)
}

fn read_pending_records(
    db_path: &PathBuf,
) -> Result<(Vec<TaskSyncPayload>, Vec<ProjectSyncPayload>), String> {
    let conn = rusqlite::Connection::open(db_path)
        .map_err(|e| format!("No se pudo abrir SQLite: {}", e))?;

    // Leer tareas no sincronizadas
    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, title, description, status, priority,
                    start_date, end_date, assigned_to, updated_at
             FROM tasks WHERE synced = 0",
        )
        .map_err(|e| e.to_string())?;

    let tasks: Vec<TaskSyncPayload> = stmt
        .query_map([], |row| {
            Ok(TaskSyncPayload {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: row.get(4)?,
                priority: row.get(5)?,
                start_date: row.get(6)?,
                end_date: row.get(7)?,
                assigned_to: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Leer proyectos no sincronizados
    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, updated_at
             FROM projects WHERE synced = 0",
        )
        .map_err(|e| e.to_string())?;

    let projects: Vec<ProjectSyncPayload> = stmt
        .query_map([], |row| {
            Ok(ProjectSyncPayload {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok((tasks, projects))
}

async fn push_task_to_backend(task: &TaskSyncPayload, token: &str) -> Result<(), String> {
    let client = build_http_client()?;
    let url = format!("{}/tasks/{}", BACKEND_URL, task.id);

    let res = client
        .put(&url)
        .bearer_auth(token)
        .json(task)
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if res.status().is_success() {
        Ok(())
    } else {
        Err(format!("Backend respondió {}", res.status()))
    }
}

async fn push_project_to_backend(project: &ProjectSyncPayload, token: &str) -> Result<(), String> {
    let client = build_http_client()?;
    let url = format!("{}/projects/{}", BACKEND_URL, project.id);

    let res = client
        .put(&url)
        .bearer_auth(token)
        .json(project)
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if res.status().is_success() {
        Ok(())
    } else {
        Err(format!("Backend respondió {}", res.status()))
    }
}

async fn mark_task_synced(app: &AppHandle, task_id: &str) -> Result<(), String> {
    let db_path = get_db_path(app)?;
    let task_id = task_id.to_string();

    tokio::task::spawn_blocking(move || {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("SQLite open error: {}", e))?;
        conn.execute("UPDATE tasks SET synced = 1 WHERE id = ?1", [&task_id])
            .map_err(|e| format!("SQLite update error: {}", e))?;
        Ok::<_, String>(())
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    Ok(())
}

async fn mark_project_synced(app: &AppHandle, project_id: &str) -> Result<(), String> {
    let db_path = get_db_path(app)?;
    let project_id = project_id.to_string();

    tokio::task::spawn_blocking(move || {
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| format!("SQLite open error: {}", e))?;
        conn.execute(
            "UPDATE projects SET synced = 1 WHERE id = ?1",
            [&project_id],
        )
        .map_err(|e| format!("SQLite update error: {}", e))?;
        Ok::<_, String>(())
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    Ok(())
}

// ─────────────────────────────────────────────
//  LOOP DE NOTIFICACIONES
// ─────────────────────────────────────────────

async fn run_notification_loop(app: AppHandle) {
    // Esperar al inicio
    time::sleep(Duration::from_secs(10)).await;

    let mut interval = time::interval(Duration::from_secs(NOTIF_CHECK_INTERVAL_SECS));

    loop {
        interval.tick().await;

        match check_and_fire_notifications(&app).await {
            Ok(count) if count > 0 => {
                log::info!("🔔 {} notificaciones disparadas", count);
            }
            Ok(_) => {}
            Err(e) => {
                log::warn!("Error al disparar notificaciones: {}", e);
            }
        }
    }
}

async fn check_and_fire_notifications(app: &AppHandle) -> Result<usize, String> {
    let db_path = get_db_path(app)?;
    if !db_path.exists() {
        return Ok(0);
    }

    let now_str = chrono::Utc::now().to_rfc3339();

    #[derive(Debug)]
    struct PendingNotif {
        id: String,
        title: String,
        body: String,
    }

    // Leer notificaciones cuyo fire_at ya pasó
    let pending: Vec<PendingNotif> = tokio::task::spawn_blocking({
        let db_path = db_path.clone();
        let now_str = now_str.clone();
        move || {
            let conn = rusqlite::Connection::open(&db_path)
                .map_err(|e| format!("SQLite open: {}", e))?;

            let mut stmt = conn
                .prepare(
                    "SELECT id, title, body FROM pending_notifications
                     WHERE fired = 0 AND fire_at <= ?1",
                )
                .map_err(|e| e.to_string())?;

            let notifs: Vec<PendingNotif> = stmt
                .query_map([&now_str], |row| {
                    Ok(PendingNotif {
                        id: row.get(0)?,
                        title: row.get(1)?,
                        body: row.get(2)?,
                    })
                })
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();

            Ok::<_, String>(notifs)
        }
    })
    .await
    .map_err(|e| format!("Spawn error: {}", e))??;

    let mut fired_count = 0usize;

    for notif in pending {
        // Disparar notificación nativa
        match crate::commands::notifications::fire_native_notification(
            app,
            &notif.title,
            &notif.body,
        ) {
            Ok(_) => {
                // Marcar como disparada en SQLite
                let db_path = db_path.clone();
                let notif_id = notif.id.clone();

                tokio::task::spawn_blocking(move || {
                    let conn = rusqlite::Connection::open(&db_path).ok()?;
                    conn.execute(
                        "UPDATE pending_notifications SET fired = 1 WHERE id = ?1",
                        [&notif_id],
                    )
                    .ok()
                })
                .await
                .ok();

                fired_count += 1;
            }
            Err(e) => log::warn!("Error al disparar notif {}: {}", notif.id, e),
        }
    }

    Ok(fired_count)
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

async fn get_auth_token(app: &AppHandle) -> Result<String, String> {
    use tauri_plugin_store::StoreExt;

    let store = app
        .store("auth.json")
        .map_err(|e| format!("Error al abrir store: {}", e))?;

    let token = store
        .get("token")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or_default();

    Ok(token)
}

fn build_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Error al crear HTTP client: {}", e))
}

async fn is_online() -> bool {
    let client = match build_http_client() {
        Ok(c) => c,
        Err(_) => return false,
    };

    client
        .get("https://1.1.1.1")
        .timeout(Duration::from_secs(3))
        .send()
        .await
        .is_ok()
}
