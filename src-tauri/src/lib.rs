pub mod avb_signer;
pub mod config;
pub mod device;
pub mod executor;
pub mod flasher;
pub mod gpt_fixer;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            device::start_device_polling(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            config::cmd_load_config,
            config::cmd_save_config,
            flasher::flash_boot,
            flasher::restore_boot,
            gpt_fixer::fix_gpt_slot,
            avb_signer::sign_avb,
            device::get_device_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
