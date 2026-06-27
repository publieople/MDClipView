use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    #[serde(default = "default_hotkey")]
    pub hotkey: String,
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default)]
    pub auto_start: bool,
    #[serde(default = "default_width")]
    pub window_width: f64,
    #[serde(default = "default_height")]
    pub window_height: f64,
    #[serde(default = "default_true")]
    pub auto_read_clipboard: bool,
}

fn default_hotkey() -> String { "Ctrl+Shift+M".into() }
fn default_theme() -> String { "dark".into() }
fn default_width() -> f64 { 800.0 }
fn default_height() -> f64 { 600.0 }
fn default_true() -> bool { true }

impl Default for Settings {
    fn default() -> Self {
        Self {
            hotkey: default_hotkey(),
            theme: default_theme(),
            auto_start: false,
            window_width: default_width(),
            window_height: default_height(),
            auto_read_clipboard: true,
        }
    }
}

fn config_path() -> PathBuf {
    let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("mdclipview");
    path.push("config.json");
    path
}

pub fn ensure_config_dir() -> Result<(), Box<dyn std::error::Error>> {
    if let Some(parent) = config_path().parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

pub fn load_settings(_app: &AppHandle) -> Result<Settings, Box<dyn std::error::Error>> {
    let path = config_path();
    if path.exists() {
        let content = fs::read_to_string(&path)?;
        Ok(serde_json::from_str(&content).unwrap_or_default())
    } else {
        Ok(Settings::default())
    }
}

pub fn save_settings(_app: &AppHandle, settings: &Settings) -> Result<(), Box<dyn std::error::Error>> {
    ensure_config_dir()?;
    let content = serde_json::to_string_pretty(settings)?;
    fs::write(config_path(), content)?;
    Ok(())
}
