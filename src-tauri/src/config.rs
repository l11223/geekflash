use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::models::AppConfig;

const CONFIG_FILE_NAME: &str = "config.json";

/// Get the config file path: `$APP_DATA_DIR/config.json`
fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {e}"))?;
    Ok(dir.join(CONFIG_FILE_NAME))
}

/// Load config from disk. Returns `AppConfig::default()` on any error
/// (missing file, corrupted JSON, IO error, etc.).
pub fn load_config(app: &AppHandle) -> AppConfig {
    let path = match config_path(app) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("[config] Warning: {e}, using default config");
            return AppConfig::default();
        }
    };

    let data = match fs::read_to_string(&path) {
        Ok(d) => d,
        Err(e) => {
            if e.kind() != std::io::ErrorKind::NotFound {
                eprintln!(
                    "[config] Warning: failed to read {}: {e}, using default config",
                    path.display()
                );
            }
            return AppConfig::default();
        }
    };

    match serde_json::from_str::<AppConfig>(&data) {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!(
                "[config] Warning: corrupted config at {}: {e}, using default config",
                path.display()
            );
            AppConfig::default()
        }
    }
}

/// Save config to disk as JSON. Creates the parent directory if needed.
pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {e}"))?;
    }

    let json =
        serde_json::to_string_pretty(config).map_err(|e| format!("Failed to serialize config: {e}"))?;

    fs::write(&path, json).map_err(|e| format!("Failed to write config file: {e}"))?;

    Ok(())
}

// === Tauri Commands ===

#[tauri::command]
pub async fn cmd_load_config(app: AppHandle) -> Result<AppConfig, String> {
    Ok(load_config(&app))
}

#[tauri::command]
pub async fn cmd_save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    save_config(&app, &config)
}
