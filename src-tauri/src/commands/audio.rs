//! Comandos relacionados con audio para DockTask Music.
//! Permite listar archivos locales, cachear desde S3, y manejar reproducción offline.
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalAudioFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub duration: Option<f64>, // segundos, extraído de metadatos (opcional)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheRequest {
    pub track_id: u32,
    pub s3_url: String,
    pub title: String,
}

/// Lista archivos de audio en el directorio de música del dispositivo (solo Android/iOS).
/// En desktop busca en ~/Music o directorio seleccionado.
#[tauri::command]
pub async fn list_local_audio_files(_app: tauri::AppHandle) -> Result<Vec<LocalAudioFile>, String> {
    // TODO: Implementar según plataforma
    // Para Android: usar intent o mediastore
    // Para iOS: usar MPMediaQuery
    // Para desktop: escanear directorio común
    
    // Por ahora devuelve lista vacía (placeholder)
    Ok(vec![])
}

/// Descarga un track desde S3 y lo guarda en cache local (SQLite o filesystem).
/// Retorna la ruta local del archivo cacheado.
#[tauri::command]
pub async fn cache_audio_from_s3(
    app: tauri::AppHandle,
    request: CacheRequest,
) -> Result<String, String> {
    let track_id = request.track_id;
    let s3_url = request.s3_url;
    
    // Directorio de cache: {app_data_dir}/music_cache/
    let cache_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo obtener app_data_dir: {}", e))?
        .join("music_cache");
    
    if !cache_dir.exists() {
        std::fs::create_dir_all(&cache_dir)
            .map_err(|e| format!("No se pudo crear directorio cache: {}", e))?;
    }
    
    let filename = format!("{}.mp3", track_id);
    let local_path = cache_dir.join(&filename);
    
    // Si ya existe, devolver ruta
    if local_path.exists() {
        return Ok(local_path.to_string_lossy().into_owned());
    }
    
    // Descargar desde S3 (usando reqwest)
    // Nota: s3_url debe ser una pre‑signed URL válida.
    let client = reqwest::Client::new();
    let response = client
        .get(&s3_url)
        .send()
        .await
        .map_err(|e| format!("Error descargando desde S3: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("HTTP error {} desde S3", response.status()));
    }
    
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Error leyendo bytes: {}", e))?;
    
    std::fs::write(&local_path, &bytes)
        .map_err(|e| format!("Error escribiendo archivo cache: {}", e))?;
    
    // Registrar en store para seguimiento
    let store = app.store("music_cache.json").map_err(|e| e.to_string())?;
    let key = format!("track_{}", track_id);
    store.set(key, serde_json::json!({
        "path": local_path.to_string_lossy(),
        "size": bytes.len(),
        "cached_at": chrono::Utc::now().to_rfc3339(),
    }));
    store.save().map_err(|e| e.to_string())?;
    
    Ok(local_path.to_string_lossy().into_owned())
}

/// Obtiene la ruta local de un track cacheado (si existe).
#[tauri::command]
pub async fn get_cached_audio_path(
    app: tauri::AppHandle,
    track_id: u32,
) -> Result<Option<String>, String> {
    let cache_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo obtener app_data_dir: {}", e))?
        .join("music_cache");
    
    let filename = format!("{}.mp3", track_id);
    let local_path = cache_dir.join(&filename);
    
    if local_path.exists() {
        Ok(Some(local_path.to_string_lossy().into_owned()))
    } else {
        Ok(None)
    }
}

/// Elimina archivos cacheados antiguos (LRU) para liberar espacio.
#[tauri::command]
pub async fn cleanup_audio_cache(
    app: tauri::AppHandle,
    _max_size_mb: u64,
) -> Result<u64, String> {
    let cache_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo obtener app_data_dir: {}", e))?
        .join("music_cache");
    
    if !cache_dir.exists() {
        return Ok(0);
    }
    
    // Implementación simple: eliminar archivos más antiguos hasta estar bajo límite.
    // Por ahora placeholder.
    Ok(0)
}