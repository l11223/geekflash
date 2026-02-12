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

export function GptFixTab({ config, updateConfig, validation }: GptFixTabProps) {
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
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">GPT Slot 修复</h2>
        <p className="text-sm text-muted-foreground/70">
          修复 GPT 分区表 slot priority，解决卡 fastboot 问题
        </p>
      </div>

      <div className="space-y-4">
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

      <div className="flex items-center gap-4 pt-2">
        <button
          disabled={!validation.canFixGpt || loading}
          onClick={handleFix}
          className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HardDrive className="h-4 w-4" />
          )}
          修复 GPT Slot
        </button>
        {result === "success" && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            修复成功
          </div>
        )}
        {result === "error" && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            修复失败
          </div>
        )}
      </div>
    </div>
  );
}
