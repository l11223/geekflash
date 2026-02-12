use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Emitter};

use crate::models::DeviceStatus;

/// Parse system_profiler output to detect device mode.
///
/// - Looks for "Vendor ID: 0x05c6" AND "Product ID: 0x9008" → "edl"
/// - Looks for "fastboot" (case-insensitive) in device names → "fastboot"
/// - Neither → "disconnected"
pub fn parse_device_status(output: &str) -> DeviceStatus {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let mode = detect_mode(output);

    DeviceStatus { mode, timestamp }
}

fn detect_mode(output: &str) -> String {
    // Check for EDL device: VID 05c6 + PID 9008
    let has_qualcomm_vid = output
        .lines()
        .any(|line| {
            let lower = line.to_lowercase();
            lower.contains("vendor id:") && lower.contains("0x05c6")
        });

    let has_edl_pid = output
        .lines()
        .any(|line| {
            let lower = line.to_lowercase();
            lower.contains("product id:") && lower.contains("0x9008")
        });

    if has_qualcomm_vid && has_edl_pid {
        return "edl".to_string();
    }

    // Check for fastboot device (case-insensitive in device names)
    let lower_output = output.to_lowercase();
    if lower_output.contains("fastboot") {
        return "fastboot".to_string();
    }

    "disconnected".to_string()
}

fn run_system_profiler() -> Result<String, String> {
    let output = std::process::Command::new("system_profiler")
        .arg("SPUSBDataType")
        .output()
        .map_err(|e| format!("Failed to run system_profiler: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// Get current device status (Tauri command).
#[tauri::command]
pub async fn get_device_status() -> Result<DeviceStatus, String> {
    let output = run_system_profiler()?;
    Ok(parse_device_status(&output))
}

/// Start background polling task (called during app setup).
/// Polls every 3 seconds and emits "device-status" event only when status changes.
pub fn start_device_polling(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last_mode = String::new();

        loop {
            if let Ok(output) = run_system_profiler() {
                let status = parse_device_status(&output);

                if status.mode != last_mode {
                    last_mode = status.mode.clone();
                    app.emit("device-status", &status).ok();
                }
            }

            std::thread::sleep(std::time::Duration::from_secs(3));
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_EDL_OUTPUT: &str = r#"
USB:

    USB 3.1 Bus:

      Host Controller Driver: AppleT6000USBXHCI

        Qualcomm CDMA Technologies MSM:

          Product ID: 0x9008
          Vendor ID: 0x05c6  (Qualcomm Incorporated)
          Version: 0.00
          Serial Number: 12345678
          Speed: Up to 480 Mb/s
          Manufacturer: Qualcomm CDMA Technologies MSM
          Location ID: 0x01100000
          Current Available (mA): 500
          Current Required (mA): 500
          Extra Operating Current (mA): 0
"#;

    const SAMPLE_FASTBOOT_OUTPUT: &str = r#"
USB:

    USB 3.1 Bus:

      Host Controller Driver: AppleT6000USBXHCI

        Android Fastboot:

          Product ID: 0x4ee7
          Vendor ID: 0x18d1  (Google Inc.)
          Version: 1.00
          Serial Number: ABCDEF123456
          Speed: Up to 480 Mb/s
          Manufacturer: Android
          Location ID: 0x01100000
"#;

    const SAMPLE_EMPTY_OUTPUT: &str = r#"
USB:

    USB 3.1 Bus:

      Host Controller Driver: AppleT6000USBXHCI

        Apple Internal Keyboard / Trackpad:

          Product ID: 0x0340
          Vendor ID: 0x05ac  (Apple Inc.)
          Version: 9.33
          Serial Number: FM7944501NGYJLA15+YBR
          Speed: Up to 480 Mb/s
          Manufacturer: Apple Inc.
          Location ID: 0x80500000
"#;

    #[test]
    fn test_parse_edl_device() {
        let status = parse_device_status(SAMPLE_EDL_OUTPUT);
        assert_eq!(status.mode, "edl");
        assert!(status.timestamp > 0);
    }

    #[test]
    fn test_parse_fastboot_device() {
        let status = parse_device_status(SAMPLE_FASTBOOT_OUTPUT);
        assert_eq!(status.mode, "fastboot");
    }

    #[test]
    fn test_parse_no_device() {
        let status = parse_device_status(SAMPLE_EMPTY_OUTPUT);
        assert_eq!(status.mode, "disconnected");
    }

    #[test]
    fn test_parse_empty_output() {
        let status = parse_device_status("");
        assert_eq!(status.mode, "disconnected");
    }

    #[test]
    fn test_edl_requires_both_vid_and_pid() {
        // Only VID, no PID → not EDL
        let only_vid = r#"
          Vendor ID: 0x05c6  (Qualcomm Incorporated)
          Product ID: 0x1234
        "#;
        assert_eq!(parse_device_status(only_vid).mode, "disconnected");

        // Only PID, no VID → not EDL
        let only_pid = r#"
          Vendor ID: 0x1234
          Product ID: 0x9008
        "#;
        assert_eq!(parse_device_status(only_pid).mode, "disconnected");
    }

    #[test]
    fn test_edl_takes_priority_over_fastboot() {
        // If both EDL and fastboot markers are present, EDL wins
        let both = r#"
          Vendor ID: 0x05c6
          Product ID: 0x9008
          Android Fastboot Device
        "#;
        assert_eq!(parse_device_status(both).mode, "edl");
    }
}
