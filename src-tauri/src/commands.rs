use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub fn get_clipboard_text(app: AppHandle) -> Result<String, String> {
    app.clipboard().read_text().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<crate::config::Settings, String> {
    crate::config::load_settings(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: crate::config::Settings) -> Result<(), String> {
    crate::config::save_settings(&app, &settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_autostart_status(_app: AppHandle) -> Result<bool, String> {
    // Autostart plugin requires MacosLauncher on macOS; on other platforms, check via env
    // For now, return false as placeholder; full impl in Phase 2
    Ok(false)
}

#[tauri::command]
pub fn set_autostart(_app: AppHandle, _enable: bool) -> Result<(), String> {
    // Placeholder; will be implemented via tauri-plugin-autostart in Phase 2
    Ok(())
}
