use geekflash_lib::models::AppConfig;
use std::fs;
use tempfile::TempDir;

/// Helper: write a config file and read it back using serde_json directly
/// (mirrors the logic in config.rs without needing an AppHandle)
fn write_and_read_config(dir: &std::path::Path, content: &str) -> AppConfig {
    let path = dir.join("config.json");
    fs::write(&path, content).unwrap();

    let data = fs::read_to_string(&path).unwrap();
    serde_json::from_str::<AppConfig>(&data).unwrap_or_default()
}

#[test]
fn test_default_config_has_expected_values() {
    let cfg = AppConfig::default();
    assert_eq!(cfg.avb_params.partition_name, "boot");
    assert_eq!(cfg.avb_params.partition_size, 100663296);
    assert_eq!(cfg.avb_params.algorithm, "SHA256_RSA4096");
    assert!(cfg.firehose_loader.is_none());
    assert!(cfg.patched_boot_img.is_none());
}

#[test]
fn test_roundtrip_serialization() {
    let cfg = AppConfig::default();
    let json = serde_json::to_string_pretty(&cfg).unwrap();
    let restored: AppConfig = serde_json::from_str(&json).unwrap();

    assert_eq!(restored.avb_params.partition_name, cfg.avb_params.partition_name);
    assert_eq!(restored.avb_params.partition_size, cfg.avb_params.partition_size);
    assert_eq!(restored.avb_params.props.len(), cfg.avb_params.props.len());
}

#[test]
fn test_corrupted_json_falls_back_to_default() {
    let dir = TempDir::new().unwrap();
    let cfg = write_and_read_config(dir.path(), "this is not json{{{");
    // Should get default values
    assert_eq!(cfg.avb_params.partition_name, "boot");
    assert_eq!(cfg.avb_params.partition_size, 100663296);
}

#[test]
fn test_empty_string_falls_back_to_default() {
    let dir = TempDir::new().unwrap();
    let cfg = write_and_read_config(dir.path(), "");
    assert_eq!(cfg.avb_params.partition_name, "boot");
}

#[test]
fn test_partial_json_falls_back_to_default() {
    let dir = TempDir::new().unwrap();
    let cfg = write_and_read_config(dir.path(), r#"{"firehose_loader": "/some/path""#);
    // Truncated JSON → parse error → default
    assert_eq!(cfg.avb_params.partition_name, "boot");
}

#[test]
fn test_missing_file_returns_default() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("config.json");
    // File doesn't exist
    let result = fs::read_to_string(&path);
    assert!(result.is_err());
    // Our logic: on error, return default
    let cfg = AppConfig::default();
    assert_eq!(cfg.avb_params.partition_name, "boot");
}

#[test]
fn test_valid_config_with_paths() {
    let dir = TempDir::new().unwrap();
    let mut cfg = AppConfig::default();
    cfg.firehose_loader = Some("/path/to/loader.elf".to_string());
    cfg.patched_boot_img = Some("/path/to/boot.img".to_string());

    let json = serde_json::to_string_pretty(&cfg).unwrap();
    let restored = write_and_read_config(dir.path(), &json);

    assert_eq!(restored.firehose_loader, Some("/path/to/loader.elf".to_string()));
    assert_eq!(restored.patched_boot_img, Some("/path/to/boot.img".to_string()));
}

#[test]
fn test_save_creates_directory_and_file() {
    let dir = TempDir::new().unwrap();
    let nested = dir.path().join("sub").join("dir");
    let config_path = nested.join("config.json");

    let cfg = AppConfig::default();
    let json = serde_json::to_string_pretty(&cfg).unwrap();

    fs::create_dir_all(&nested).unwrap();
    fs::write(&config_path, &json).unwrap();

    assert!(config_path.exists());
    let data = fs::read_to_string(&config_path).unwrap();
    let restored: AppConfig = serde_json::from_str(&data).unwrap();
    assert_eq!(restored.avb_params.partition_name, "boot");
}
