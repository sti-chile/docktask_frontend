/// offline.rs — Comandos para manejo de datos locales con SQLite
/// El frontend llama a estos comandos vía: invoke("save_task_offline", { task })

use serde::{Deserialize, Serialize};
use tauri_plugin_sql::{Migration, MigrationKind};

// ─────────────────────────────────────────────
//  MODELOS
// ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskOffline {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub assigned_to: Option<String>,
    pub updated_at: String,
    pub synced: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectOffline {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub updated_at: String,
    pub synced: bool,
}

// ─────────────────────────────────────────────
//  MIGRACIONES (se ejecutan al iniciar la app)
// ─────────────────────────────────────────────

pub fn db_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Crear tablas base",
            sql: r#"
                CREATE TABLE IF NOT EXISTS tasks (
                    id          TEXT PRIMARY KEY,
                    project_id  TEXT NOT NULL,
                    title       TEXT NOT NULL,
                    description TEXT,
                    status      TEXT NOT NULL DEFAULT 'pending',
                    priority    TEXT NOT NULL DEFAULT 'medium',
                    start_date  TEXT,
                    end_date    TEXT,
                    assigned_to TEXT,
                    updated_at  TEXT NOT NULL,
                    synced      INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS projects (
                    id          TEXT PRIMARY KEY,
                    name        TEXT NOT NULL,
                    description TEXT,
                    updated_at  TEXT NOT NULL,
                    synced      INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS pending_notifications (
                    id          TEXT PRIMARY KEY,
                    task_id     TEXT,
                    title       TEXT NOT NULL,
                    body        TEXT NOT NULL,
                    fire_at     TEXT NOT NULL,
                    fired       INTEGER NOT NULL DEFAULT 0,
                    created_at  TEXT NOT NULL
                );
            "#,
            kind: MigrationKind::Up,
        },
    ]
}

// ─────────────────────────────────────────────
//  COMANDOS
// ─────────────────────────────────────────────

/// Guarda o actualiza una tarea en SQLite local (con synced=false)
#[tauri::command]
pub async fn save_task_offline(task: TaskOffline) -> Result<(), String> {
    // La DB se maneja a través del plugin tauri-plugin-sql desde el frontend.
    // Este comando sirve como validación/hook adicional desde Rust si se necesita.
    log::info!(
        "save_task_offline: task_id={} synced={}",
        task.id,
        task.synced
    );
    Ok(())
}

/// Guarda o actualiza un proyecto en SQLite local
#[tauri::command]
pub async fn save_project_offline(project: ProjectOffline) -> Result<(), String> {
    log::info!(
        "save_project_offline: project_id={} synced={}",
        project.id,
        project.synced
    );
    Ok(())
}

/// Retorna los IDs de tareas pendientes de sincronizar
#[tauri::command]
pub async fn get_pending_sync() -> Result<Vec<String>, String> {
    // Esta función se puede expandir para leer desde SQLite directamente
    // Por ahora retorna vacío; el sync worker lo maneja internamente
    Ok(vec![])
}
