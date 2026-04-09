/// calendar.rs — Integración con el calendario del sistema operativo
/// Permite crear eventos nativos (Google Calendar / Apple Calendar / Outlook)

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CalendarEvent {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: String,   // ISO 8601
    pub end_date: String,     // ISO 8601
    pub all_day: bool,
    pub location: Option<String>,
}

/// Agrega un evento al calendario nativo del OS
/// Llamado cuando el usuario hace "Agregar al calendario" en una tarea
///
/// Ejemplo desde JS:
/// ```js
/// await invoke("add_to_os_calendar", {
///   event: {
///     id: "task-456",
///     title: "Entrega: Diseño Gantt",
///     description: "Completar wireframes del módulo Gantt",
///     start_date: "2026-03-01T09:00:00Z",
///     end_date: "2026-03-01T18:00:00Z",
///     all_day: false,
///     location: null
///   }
/// });
/// ```
#[tauri::command]
pub async fn add_to_os_calendar(event: CalendarEvent) -> Result<String, String> {
    log::info!(
        "Agregar al calendario OS: id={} title={}",
        event.id,
        event.title
    );

    // En desktop: abrir la URL del calendario con el formato ICS
    // En mobile: usar tauri-plugin-calendar (cuando esté disponible)
    // Por ahora generamos un archivo .ics descargable
    let ics_content = generate_ics(&event);

    log::info!("ICS generado para evento: {}", event.id);

    // TODO: En mobile, integrar con tauri-plugin-calendar v2
    // Por ahora retornamos el ICS como string para que el frontend lo descargue
    Ok(ics_content)
}

/// Elimina un evento del calendario nativo
#[tauri::command]
pub async fn remove_from_os_calendar(event_id: String) -> Result<(), String> {
    log::info!("Eliminar del calendario OS: id={}", event_id);
    // TODO: Integrar con API nativa del OS
    Ok(())
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

fn generate_ics(event: &CalendarEvent) -> String {
    let start = event.start_date.replace(['-', ':', '.'], "").replace("Z", "");
    let end = event.end_date.replace(['-', ':', '.'], "").replace("Z", "");
    let now = chrono::Utc::now()
        .format("%Y%m%dT%H%M%S")
        .to_string();

    let description = event
        .description
        .as_deref()
        .unwrap_or("")
        .replace('\n', "\\n");

    format!(
        r#"BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DockTask//STI Chile//ES
BEGIN:VEVENT
UID:{uid}@docktask.sti-chile.cl
DTSTAMP:{now}Z
DTSTART:{start}Z
DTEND:{end}Z
SUMMARY:{title}
DESCRIPTION:{description}
END:VEVENT
END:VCALENDAR"#,
        uid = event.id,
        now = now,
        start = start,
        end = end,
        title = event.title,
        description = description,
    )
}
