use tauri::AppHandle;

use crate::executor::execute_sequence;
use crate::models::{CommandResult, CommandSpec};

/// Build the command sequence for GPT slot repair via EDL.
///
/// Sequence:
/// 1. `sudo edl ws 0 <gpt_main> --lun=4 --loader=<loader>` — write main GPT
/// 2. `sudo edl ws 1048543 <gpt_backup> --lun=4 --loader=<loader>` — write backup GPT
pub fn build_fix_gpt_commands(gpt_main: &str, gpt_backup: &str, loader: &str) -> Vec<CommandSpec> {
    vec![
        CommandSpec {
            program: "edl".to_string(),
            args: vec![
                "ws".to_string(),
                "0".to_string(),
                gpt_main.to_string(),
                "--lun=4".to_string(),
                format!("--loader={}", loader),
            ],
            sudo: true,
            delay_before_ms: 0,
        },
        CommandSpec {
            program: "edl".to_string(),
            args: vec![
                "ws".to_string(),
                "1048543".to_string(),
                gpt_backup.to_string(),
                "--lun=4".to_string(),
                format!("--loader={}", loader),
            ],
            sudo: true,
            delay_before_ms: 0,
        },
    ]
}

#[tauri::command]
pub async fn fix_gpt_slot(
    app: AppHandle,
    gpt_main: String,
    gpt_backup: String,
    loader: String,
) -> Result<CommandResult, String> {
    let commands = build_fix_gpt_commands(&gpt_main, &gpt_backup, &loader);
    execute_sequence(&app, commands).await
}
