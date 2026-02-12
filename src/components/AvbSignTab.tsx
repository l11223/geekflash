import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, AvbParams, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface AvbSignTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function AvbSignTab({ config, updateConfig, validation }: AvbSignTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const updateAvbParams = (patch: Partial<AvbParams>) => {
    updateConfig({ avb_params: { ...config.avb_params, ...patch } });
  };

  const handleSign = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await invoke<CommandResult>("sign_avb", {
        bootImg: config.patched_boot_img,
        avbtoolPath: config.avbtool_path,
        keyPath: config.avb_key_path,
        params: config.avb_params,
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
        <h2 className="text-lg font-bold text-foreground">AVB 签名</h2>
        <p className="text-sm text-muted-foreground/70">
          对 boot.img 进行 AVB 签名，用于 BL 锁定状态下刷入
        </p>
      </div>

      <div className="space-y-4">
        <FilePickerField
          label="Boot 镜像 (.img)"
          value={config.patched_boot_img}
          filters={[{ name: "Boot Image", extensions: ["img"] }]}
          onChange={(path) => updateConfig({ patched_boot_img: path })}
        />
        <FilePickerField
          label="avbtool.py 路径"
          value={config.avbtool_path}
          filters={[{ name: "Python Script", extensions: ["py"] }]}
          onChange={(path) => updateConfig({ avbtool_path: path })}
        />
        <FilePickerField
          label="RSA 密钥文件 (.pem)"
          value={config.avb_key_path}
          filters={[{ name: "PEM Key", extensions: ["pem"] }]}
          onChange={(path) => updateConfig({ avb_key_path: path })}
        />
      </div>

      {/* AVB Parameters */}
      <div className="border-t border-border/30 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
          AVB 签名参数
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/60">
              partition_size
            </label>
            <Input
              type="number"
              value={config.avb_params.partition_size}
              onChange={(e) =>
                updateAvbParams({ partition_size: Number(e.target.value) })
              }
              className="bg-secondary/30 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/60">
              algorithm
            </label>
            <Input
              value={config.avb_params.algorithm}
              onChange={(e) =>
                updateAvbParams({ algorithm: e.target.value })
              }
              className="bg-secondary/30 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/60">
              rollback_index
            </label>
            <Input
              type="number"
              value={config.avb_params.rollback_index}
              onChange={(e) =>
                updateAvbParams({ rollback_index: Number(e.target.value) })
              }
              className="bg-secondary/30 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/60">salt</label>
            <Input
              value={config.avb_params.salt}
              onChange={(e) => updateAvbParams({ salt: e.target.value })}
              className="bg-secondary/30 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/60">
            Props（只读）
          </label>
          <div className="rounded-xl border border-border/30 bg-secondary/20 p-3 space-y-1 font-mono text-[11px]">
            {config.avb_params.props.map((prop, i) => (
              <div key={i} className="text-muted-foreground/70">
                {prop.key}={prop.value}
              </div>
            ))}
            {config.avb_params.props.length === 0 && (
              <div className="text-muted-foreground/40 italic">
                无 prop 配置
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          disabled={!validation.canSignAvb || loading}
          onClick={handleSign}
          className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          AVB 签名
        </button>
        {result === "success" && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            签名成功
          </div>
        )}
        {result === "error" && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            签名失败
          </div>
        )}
      </div>
    </div>
  );
}
