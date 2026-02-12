import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, AvbParams, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface AvbSignTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function AvbSignTab({
  config,
  updateConfig,
  validation,
}: AvbSignTabProps) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground/95 tracking-tight">
          AVB 签名
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          对 boot.img 进行 AVB 签名，用于 BL 锁定状态下刷入
        </p>
      </div>

      {/* File fields */}
      <div className="content-card p-5 space-y-4">
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
      <div className="content-card p-5 space-y-4">
        <div className="section-label">签名参数</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground/50">
              partition_size
            </label>
            <input
              type="number"
              value={config.avb_params.partition_size}
              onChange={(e) =>
                updateAvbParams({ partition_size: Number(e.target.value) })
              }
              className="param-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground/50">
              algorithm
            </label>
            <input
              value={config.avb_params.algorithm}
              onChange={(e) =>
                updateAvbParams({ algorithm: e.target.value })
              }
              className="param-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground/50">
              rollback_index
            </label>
            <input
              type="number"
              value={config.avb_params.rollback_index}
              onChange={(e) =>
                updateAvbParams({ rollback_index: Number(e.target.value) })
              }
              className="param-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground/50">
              salt
            </label>
            <input
              value={config.avb_params.salt}
              onChange={(e) => updateAvbParams({ salt: e.target.value })}
              className="param-input"
            />
          </div>
        </div>

        {/* Props */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground/50">
            Props（只读）
          </label>
          <div className="rounded-md border border-border/60 bg-[hsl(228_24%_8%)] p-3 space-y-0.5 font-mono text-[11px]">
            {config.avb_params.props.map((prop, i) => (
              <div key={i} className="text-muted-foreground/50">
                {prop.key}
                <span className="text-muted-foreground/30">=</span>
                {prop.value}
              </div>
            ))}
            {config.avb_params.props.length === 0 && (
              <div className="text-muted-foreground/25 italic">
                无 prop 配置
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-3">
        <button
          disabled={!validation.canSignAvb || loading}
          onClick={handleSign}
          className="action-btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          AVB 签名
        </button>
        {result === "success" && (
          <span className="result-badge success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            签名成功
          </span>
        )}
        {result === "error" && (
          <span className="result-badge error">
            <XCircle className="w-3.5 h-3.5" />
            签名失败
          </span>
        )}
      </div>
    </div>
  );
}
