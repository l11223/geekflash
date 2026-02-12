use tauri::AppHandle;

use crate::executor::execute_sequence;
use crate::models::{AvbParams, CommandResult, CommandSpec};

/// Build the command sequence for AVB signing via python3 avbtool.
///
/// Sequence:
/// 1. `python3 <avbtool> erase_footer --image <boot_img>`
/// 2. `python3 <avbtool> add_hash_footer --image <boot_img> --partition_name ...
///     --partition_size ... --algorithm ... --key ... --rollback_index ... --salt ... --prop ...`
pub fn build_sign_avb_commands(
    boot_img: &str,
    avbtool_path: &str,
    key_path: &str,
    params: &AvbParams,
) -> Vec<CommandSpec> {
    // Command 1: erase existing AVB footer
    let erase_cmd = CommandSpec {
        program: "python3".to_string(),
        args: vec![
            avbtool_path.to_string(),
            "erase_footer".to_string(),
            "--image".to_string(),
            boot_img.to_string(),
        ],
        sudo: false,
        delay_before_ms: 0,
    };

    // Command 2: add_hash_footer with all signing parameters
    let mut add_args = vec![
        avbtool_path.to_string(),
        "add_hash_footer".to_string(),
        "--image".to_string(),
        boot_img.to_string(),
        "--partition_name".to_string(),
        params.partition_name.clone(),
        "--partition_size".to_string(),
        params.partition_size.to_string(),
        "--algorithm".to_string(),
        params.algorithm.clone(),
        "--key".to_string(),
        key_path.to_string(),
        "--rollback_index".to_string(),
        params.rollback_index.to_string(),
        "--salt".to_string(),
        params.salt.clone(),
    ];

    // Append --prop key:value pairs
    for prop in &params.props {
        add_args.push("--prop".to_string());
        add_args.push(format!("{}:{}", prop.key, prop.value));
    }

    let add_cmd = CommandSpec {
        program: "python3".to_string(),
        args: add_args,
        sudo: false,
        delay_before_ms: 0,
    };

    vec![erase_cmd, add_cmd]
}

#[tauri::command]
pub async fn sign_avb(
    app: AppHandle,
    boot_img: String,
    avbtool_path: String,
    key_path: String,
    params: AvbParams,
) -> Result<CommandResult, String> {
    let commands = build_sign_avb_commands(&boot_img, &avbtool_path, &key_path, &params);
    execute_sequence(&app, commands).await
}
