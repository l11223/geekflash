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

export function FlashBootTab({ config, updateConfig, validation }: FlashBootTabProps) {
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
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">刷入 Patched Boot</h2>
        <p className="text-sm text-muted-foreground/70">
          将 patched boot.img 通过 EDL 模式刷入 boot_a 分区
        </p>
      </div>

      <div className="space-y-4">
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

      <div className="flex items-center gap-4 pt-2">
        <button
          disabled={!validation.canFlashBoot || loading}
          onClick={handleFlash}
          className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          刷入 Boot
        </button>
        {result === "success" && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            刷入成功
          </div>
        )}
        {result === "error" && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            刷入失败
          </div>
        )}
      </div>
    </div>
  );
}
