import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>AVB 签名</CardTitle>
        <CardDescription>对 boot.img 进行 AVB 签名，用于 BL 锁定状态下刷入</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="border-t border-border pt-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">AVB 签名参数</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">partition_size</label>
              <Input
                type="number"
                value={config.avb_params.partition_size}
                onChange={(e) => updateAvbParams({ partition_size: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">algorithm</label>
              <Input
                value={config.avb_params.algorithm}
                onChange={(e) => updateAvbParams({ algorithm: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">rollback_index</label>
              <Input
                type="number"
                value={config.avb_params.rollback_index}
                onChange={(e) => updateAvbParams({ rollback_index: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">salt</label>
              <Input
                value={config.avb_params.salt}
                onChange={(e) => updateAvbParams({ salt: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Props（只读）</label>
            <div className="rounded-md border border-border bg-muted/50 p-3 space-y-1 font-mono text-xs">
              {config.avb_params.props.map((prop, i) => (
                <div key={i} className="text-muted-foreground">
                  {prop.key}={prop.value}
                </div>
              ))}
              {config.avb_params.props.length === 0 && (
                <div className="text-muted-foreground">无 prop 配置</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button disabled={!validation.canSignAvb || loading} onClick={handleSign}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Shield className="mr-1.5 h-4 w-4" />}
          AVB 签名
        </Button>
        {result === "success" && <Badge className="bg-green-600 text-white">成功</Badge>}
        {result === "error" && <Badge variant="destructive">失败</Badge>}
      </CardFooter>
    </Card>
  );
}
