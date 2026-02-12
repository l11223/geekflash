import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Zap, Loader2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>刷入 Patched Boot</CardTitle>
        <CardDescription>将 patched boot.img 刷入 boot_a 分区</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button disabled={!validation.canFlashBoot || loading} onClick={handleFlash}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Zap className="mr-1.5 h-4 w-4" />}
          刷入 Boot
        </Button>
        {result === "success" && <Badge className="bg-green-600 text-white">成功</Badge>}
        {result === "error" && <Badge variant="destructive">失败</Badge>}
      </CardFooter>
    </Card>
  );
}
