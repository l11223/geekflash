use std::time::Instant;

use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::time::{timeout, Duration};

use crate::models::{CommandResult, CommandSpec, LogLine};

/// Execute a single system command asynchronously.
///
/// Streams stdout/stderr line-by-line to the frontend via `log-line` events.
/// Supports sudo prefix and a 30-second timeout.
pub async fn execute_command(
    app: &AppHandle,
    program: &str,
    args: &[&str],
    sudo: bool,
) -> Result<CommandResult, String> {
    let start = Instant::now();

    let mut cmd = if sudo {
        let mut c = Command::new("sudo");
        c.arg(program);
        c.args(args);
        c
    } else {
        let mut c = Command::new(program);
        c.args(args);
        c
    };

    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn command: {e}"))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let app_out = app.clone();
    let app_err = app.clone();

    let stdout_task = tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            let log = LogLine {
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream: "stdout".to_string(),
                content: line,
            };
            app_out.emit("log-line", &log).ok();
        }
    });

    let stderr_task = tokio::spawn(async move {
        let reader = BufReader::new(stderr);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            let log = LogLine {
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream: "stderr".to_string(),
                content: line,
            };
            app_err.emit("log-line", &log).ok();
        }
    });

    // Wait for the child with a 30-second timeout
    let result = timeout(Duration::from_secs(30), async {
        // Wait for stream readers to finish first
        let _ = stdout_task.await;
        let _ = stderr_task.await;
        child.wait().await
    })
    .await;

    let duration_ms = start.elapsed().as_millis() as u64;

    match result {
        Ok(Ok(status)) => {
            let exit_code = status.code().unwrap_or(-1);
            let cmd_result = CommandResult {
                exit_code,
                duration_ms,
            };

            // Emit completion summary
            let summary = LogLine {
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream: "stdout".to_string(),
                content: format!(
                    "Command exited with code {exit_code} (took {duration_ms}ms)"
                ),
            };
            app.emit("log-line", &summary).ok();

            Ok(cmd_result)
        }
        Ok(Err(e)) => Err(format!("Command failed: {e}")),
        Err(_) => {
            // Timeout — kill the child process
            child.kill().await.ok();
            let summary = LogLine {
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream: "stderr".to_string(),
                content: "Command timed out after 30 seconds".to_string(),
            };
            app.emit("log-line", &summary).ok();
            Err("Command timed out after 30 seconds".to_string())
        }
    }
}

/// Execute a sequence of commands in order.
///
/// Stops immediately if any command returns a non-zero exit code.
/// Supports per-command delays via `CommandSpec.delay_before_ms`.
pub async fn execute_sequence(
    app: &AppHandle,
    commands: Vec<CommandSpec>,
) -> Result<CommandResult, String> {
    let mut last_result = CommandResult {
        exit_code: 0,
        duration_ms: 0,
    };

    for (i, spec) in commands.iter().enumerate() {
        // Apply delay before this command if specified
        if spec.delay_before_ms > 0 {
            let delay_log = LogLine {
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream: "stdout".to_string(),
                content: format!("Waiting {}ms before next command...", spec.delay_before_ms),
            };
            app.emit("log-line", &delay_log).ok();
            tokio::time::sleep(Duration::from_millis(spec.delay_before_ms)).await;
        }

        // Log which command is about to run
        let cmd_display = if spec.sudo {
            format!("sudo {} {}", spec.program, spec.args.join(" "))
        } else {
            format!("{} {}", spec.program, spec.args.join(" "))
        };
        let start_log = LogLine {
            timestamp: chrono::Utc::now().to_rfc3339(),
            stream: "stdout".to_string(),
            content: format!("[{}/{}] Running: {}", i + 1, commands.len(), cmd_display),
        };
        app.emit("log-line", &start_log).ok();

        let args_refs: Vec<&str> = spec.args.iter().map(|s| s.as_str()).collect();
        let result = execute_command(app, &spec.program, &args_refs, spec.sudo).await?;

        if result.exit_code != 0 {
            return Ok(result);
        }

        last_result = result;
    }

    Ok(last_result)
}
