mod commands;
mod sync;

use tauri::Emitter;
use tauri::Listener;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    // Construir plugins base (comunes a todas las plataformas)
    let mut builder = tauri::Builder::default()
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
        );

    // Auto-updater: solo en desktop (no Android)
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        // ── Commands expuestos a JS ───────────────────────────────────────
        .invoke_handler(tauri::generate_handler![
            commands::offline::get_pending_sync,
            commands::offline::save_task_offline,
            commands::offline::save_project_offline,
            commands::notifications::schedule_task_reminder,
            commands::notifications::cancel_reminder,
            commands::notifications::get_pending_notifications,
            commands::calendar::add_to_os_calendar,
            commands::calendar::remove_from_os_calendar,
            commands::system::get_network_status,
            // Audio
            commands::audio::list_local_audio_files,
            commands::audio::cache_audio_from_s3,
            commands::audio::get_cached_audio_path,
            commands::audio::cleanup_audio_cache,
        ])
        // ── Setup: sync worker + deep link handler ────────────────────────
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Worker de sincronización en background
            tauri::async_runtime::spawn(async move {
                sync::worker::start_sync_loop(app_handle).await;
            });

            // Deep links
            #[cfg(any(target_os = "android", target_os = "linux", target_os = "windows", target_os = "macos"))]
            {
                let app_handle = app.handle().clone();
                app.listen("deep-link://new-url", move |event: tauri::Event| {
                    let url = event.payload().trim_matches('"').to_string();
                    if !url.is_empty() {
                        log::info!("🔗 Deep link: {}", url);
                        let _ = app_handle.emit("deeplink:navigate", url);
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error al iniciar DockTask");
}
