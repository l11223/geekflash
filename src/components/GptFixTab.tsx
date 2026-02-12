import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HardDrive, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface GptFixTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function GptFixTab({
  config,
  updateConfig,
  validation,
}: GptFixTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await invoke<CommandResult>("fix_gpt_slot", {
        gptMain: config.gpt_main_bin,
        gptBackup: config.gpt_backup_bin,
        loader: config.firehose_loader,
      });
      setResult(res.exit_code === 0 ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground/95 tracking-tight">
          GPT Slot 修复
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          修复 GPT 分区表 slot priority，解决卡 fastboot 问题
        </p>
      </div>

      <div className="content-card p-5 space-y-4">
        <FilePickerField
          label="GPT 主分区 (.bin)"
          value={config.gpt_main_bin}
          filters={[{ name: "GPT Binary", extensions: ["bin"] }]}
          onChange={(path) => updateConfig({ gpt_main_bin: path })}
        />
        <FilePickerField
          label="GPT 备份分区 (.bin)"
          value={config.gpt_backup_bin}
          filters={[{ name: "GPT Binary", extensions: ["bin"] }]}
          onChange={(path) => updateConfig({ gpt_backup_bin: path })}
        />
        <FilePickerField
          label="Firehose Loader (.elf)"
          value={config.firehose_loader}
          filters={[{ name: "ELF Loader", extensions: ["elf"] }]}
          onChange={(path) => updateConfig({ firehose_loader: path })}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={!validation.canFixGpt || loading}
          onClick={handleFix}
          className="action-btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <HardDrive className="w-4 h-4" />
          )}
          修复 GPT Slot
        </button>
        {result === "success" && (
          <span className="result-badge success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            修复成功
          </span>
        )}
        {result === "error" && (
          <span className="result-badge error">
            <XCircle className="w-3.5 h-3.5" />
            修复失败
          </span>
        )}
      </div>
    </div>
  );
}
