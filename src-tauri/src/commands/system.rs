/// system.rs — Info del sistema: red, plataforma, etc.

/// Verifica si hay conexión a internet intentando un ping a un host público
#[tauri::command]
pub async fn get_network_status() -> Result<bool, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())?;

    let online = client
        .get("https://1.1.1.1")
        .send()
        .await
        .is_ok();

    log::debug!("Estado de red: online={}", online);
    Ok(online)
}
