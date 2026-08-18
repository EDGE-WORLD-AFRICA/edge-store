// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use sha2::{Digest, Sha256};
mod network;

#[tauri::command]
fn get_machine_fingerprint() -> Result<String, String> {
    let machine_uid = machine_uid::get()
        .map_err(|e| format!("Failed to get machine UID: {}", e))?;

    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let raw = format!("edge-store|{}|{}", machine_uid, hostname);

    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());

    let hash = hex::encode(hasher.finalize());

    Ok(format!("sha256:{}", hash))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_machine_fingerprint,
            network::get_network_type
        ]).run(tauri::generate_context!())
        .expect("error while running [tauri] application");
}
