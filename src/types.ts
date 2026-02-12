// Shared TypeScript types mirroring Rust backend models

export interface AvbProp {
  key: string;
  value: string;
}

export interface AvbParams {
  partition_name: string;
  partition_size: number;
  algorithm: string;
  rollback_index: number;
  salt: string;
  props: AvbProp[];
}

export interface AppConfig {
  firehose_loader: string | null;
  patched_boot_img: string | null;
  stock_boot_img: string | null;
  gpt_main_bin: string | null;
  gpt_backup_bin: string | null;
  avbtool_path: string | null;
  avb_key_path: string | null;
  avb_params: AvbParams;
}

export interface DeviceStatus {
  mode: "edl" | "fastboot" | "disconnected";
  timestamp: number;
}

export interface CommandResult {
  exit_code: number;
  duration_ms: number;
}

export interface LogLine {
  timestamp: string;
  stream: "stdout" | "stderr";
  content: string;
}
