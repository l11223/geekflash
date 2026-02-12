use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct AvbProp {
    pub key: String,
    pub value: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AvbParams {
    pub partition_name: String,
    pub partition_size: u64,
    pub algorithm: String,
    pub rollback_index: u64,
    pub salt: String,
    pub props: Vec<AvbProp>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub firehose_loader: Option<String>,
    pub patched_boot_img: Option<String>,
    pub stock_boot_img: Option<String>,
    pub gpt_main_bin: Option<String>,
    pub gpt_backup_bin: Option<String>,
    pub avbtool_path: Option<String>,
    pub avb_key_path: Option<String>,
    pub avb_params: AvbParams,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            firehose_loader: None,
            patched_boot_img: None,
            stock_boot_img: None,
            gpt_main_bin: None,
            gpt_backup_bin: None,
            avbtool_path: None,
            avb_key_path: None,
            avb_params: AvbParams {
                partition_name: "boot".to_string(),
                partition_size: 100663296,
                algorithm: "SHA256_RSA4096".to_string(),
                rollback_index: 1738713600,
                salt: "2919b99b88ac41218ee8054ad02c4e1fb8c631c0b79c541c530d6bb743ea7c09"
                    .to_string(),
                props: vec![
                    AvbProp {
                        key: "com.android.build.boot.os_version".to_string(),
                        value: "15".to_string(),
                    },
                    AvbProp {
                        key: "com.android.build.boot.fingerprint".to_string(),
                        value: "Lenovo/TB322FC_PRC/TB322FC:15/AQ3A.250129.001/ZUXOS_1.1.11.044_250524_PRC:user/release-keys".to_string(),
                    },
                    AvbProp {
                        key: "com.android.build.boot.security_patch".to_string(),
                        value: "2025-02-05".to_string(),
                    },
                ],
            },
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DeviceStatus {
    pub mode: String,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CommandResult {
    pub exit_code: i32,
    pub duration_ms: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct LogLine {
    pub timestamp: String,
    pub stream: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CommandSpec {
    pub program: String,
    pub args: Vec<String>,
    pub sudo: bool,
    pub delay_before_ms: u64,
}
