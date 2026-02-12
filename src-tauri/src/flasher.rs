use tauri::AppHandle;

use crate::executor::execute_sequence;
use crate::models::{CommandResult, CommandSpec};

/// Build the command sequence for flashing boot_a partition via EDL.
///
/// Sequence:
/// 1. `fastboot oem edl` — switch device into EDL mode
/// 2. (2s delay) `sudo edl w boot_a <boot_img> --loader=<loader>` — write boot image
pub fn build_flash_boot_commands(boot_img: &str, loader: &str) -> Vec<CommandSpec> {
    vec![
        CommandSpec {
            program: "fastboot".to_string(),
            args: vec!["oem".to_string(), "edl".to_string()],
            sudo: false,
            delay_before_ms: 0,
        },
        CommandSpec {
            program: "edl".to_string(),
            args: vec![
                "w".to_string(),
                "boot_a".to_string(),
                boot_img.to_string(),
                format!("--loader={}", loader),
            ],
            sudo: true,
            delay_before_ms: 2000,
        },
    ]
}

#[tauri::command]
pub async fn flash_boot(
    app: AppHandle,
    boot_img: String,
    loader: String,
) -> Result<CommandResult, String> {
    let commands = build_flash_boot_commands(&boot_img, &loader);
    execute_sequence(&app, commands).await
}

#[tauri::command]
pub async fn restore_boot(
    app: AppHandle,
    boot_img: String,
    loader: String,
) -> Result<CommandResult, String> {
    let commands = build_flash_boot_commands(&boot_img, &loader);
    execute_sequence(&app, commands).await
}
