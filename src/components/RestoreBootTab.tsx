import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface RestoreBootTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function RestoreBootTab({
  config,
  updateConfig,
  validation,
}: RestoreBootTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleRestore = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await invoke<CommandResult>("restore_boot", {
        bootImg: config.stock_boot_img,
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
          恢复原厂 Boot
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          将原厂 boot.img 刷入 boot_a 分区，用于救砖恢复
        </p>
      </div>

      <div className="content-card p-5 space-y-4">
        <FilePickerField
          label="原厂 Boot 镜像 (.img)"
          value={config.stock_boot_img}
          filters={[{ name: "Boot Image", extensions: ["img"] }]}
          onChange={(path) => updateConfig({ stock_boot_img: path })}
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
          disabled={!validation.canRestoreBoot || loading}
          onClick={handleRestore}
          className="action-btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          恢复原厂 Boot
        </button>
        {result === "success" && (
          <span className="result-badge success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            恢复成功
          </span>
        )}
        {result === "error" && (
          <span className="result-badge error">
            <XCircle className="w-3.5 h-3.5" />
            恢复失败
          </span>
        )}
      </div>
    </div>
  );
}
