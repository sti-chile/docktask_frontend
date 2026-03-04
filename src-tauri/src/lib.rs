mod commands;
mod sync;

use tauri::Emitter;
use tauri::Listener;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        // ── Plugins ──────────────────────────────────────────────────────
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:docktask.db", commands::offline::db_migrations())
                .build(),
        )
        // ── Commands expuestos a JS ───────────────────────────────────────
        .invoke_handler(tauri::generate_handler![
            // Offline / base de datos local
            commands::offline::get_pending_sync,
            commands::offline::save_task_offline,
            commands::offline::save_project_offline,
            // Notificaciones y alarmas
            commands::notifications::schedule_task_reminder,
            commands::notifications::cancel_reminder,
            commands::notifications::get_pending_notifications,
            // Calendario del sistema
            commands::calendar::add_to_os_calendar,
            commands::calendar::remove_from_os_calendar,
            // Info del sistema
            commands::system::get_network_status,
        ])
        // ── Setup: sync worker + deep link handler ────────────────────────
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Iniciar el worker de sincronización en un thread separado
            tauri::async_runtime::spawn(async move {
                sync::worker::start_sync_loop(app_handle).await;
            });

            // Manejar deep links — reenviar URL a React para que el router la procese
            #[cfg(any(target_os = "android", target_os = "linux", target_os = "windows", target_os = "macos"))]
            {
                let app_handle = app.handle().clone();
                app.listen("deep-link://new-url", move |event: tauri::Event| {
                    let payload = event.payload();
                    let url = payload
                        .trim_matches('"');
                    if !url.is_empty() {
                        log::info!("🔗 Deep link recibido: {}", url);
                        let _ = app_handle.emit("deeplink:navigate", url.to_string());
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error al iniciar DockTask");
}
