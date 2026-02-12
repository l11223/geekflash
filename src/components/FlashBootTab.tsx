import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Zap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface FlashBootTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function FlashBootTab({
  config,
  updateConfig,
  validation,
}: FlashBootTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleFlash = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await invoke<CommandResult>("flash_boot", {
        bootImg: config.patched_boot_img,
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
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground/95 tracking-tight">
          刷入 Patched Boot
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          将 patched boot.img 通过 EDL 模式刷入 boot_a 分区
        </p>
      </div>

      {/* File fields */}
      <div className="content-card p-5 space-y-4">
        <FilePickerField
          label="Patched Boot 镜像 (.img)"
          value={config.patched_boot_img}
          filters={[{ name: "Boot Image", extensions: ["img"] }]}
          onChange={(path) => updateConfig({ patched_boot_img: path })}
        />
        <FilePickerField
          label="Firehose Loader (.elf)"
          value={config.firehose_loader}
          filters={[{ name: "ELF Loader", extensions: ["elf"] }]}
          onChange={(path) => updateConfig({ firehose_loader: path })}
        />
      </div>

      {/* Action */}
      <div className="flex items-center gap-3">
        <button
          disabled={!validation.canFlashBoot || loading}
          onClick={handleFlash}
          className="action-btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          刷入 Boot
        </button>
        {result === "success" && (
          <span className="result-badge success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            刷入成功
          </span>
        )}
        {result === "error" && (
          <span className="result-badge error">
            <XCircle className="w-3.5 h-3.5" />
            刷入失败
          </span>
        )}
      </div>
    </div>
  );
}
