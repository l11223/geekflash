import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FilePickerField } from "@/components/FilePickerField";
import type { AppConfig, CommandResult } from "@/types";
import type { ActionValidation } from "@/hooks/useActionValidation";

interface RestoreBootTabProps {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  validation: ActionValidation;
}

export function RestoreBootTab({ config, updateConfig, validation }: RestoreBootTabProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>恢复原厂 Boot</CardTitle>
        <CardDescription>将原厂 boot.img 刷入 boot_a 分区，用于救砖</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button disabled={!validation.canRestoreBoot || loading} onClick={handleRestore}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-1.5 h-4 w-4" />}
          恢复原厂 Boot
        </Button>
        {result === "success" && <Badge className="bg-green-600 text-white">成功</Badge>}
        {result === "error" && <Badge variant="destructive">失败</Badge>}
      </CardFooter>
    </Card>
  );
}
