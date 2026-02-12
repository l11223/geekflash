import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HardDrive, Loader2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>GPT Slot 修复</CardTitle>
        <CardDescription>修复 GPT 分区表 slot priority，解决卡 fastboot 问题</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button disabled={!validation.canFixGpt || loading} onClick={handleFix}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <HardDrive className="mr-1.5 h-4 w-4" />}
          修复 GPT Slot
        </Button>
        {result === "success" && <Badge className="bg-green-600 text-white">成功</Badge>}
        {result === "error" && <Badge variant="destructive">失败</Badge>}
      </CardFooter>
    </Card>
  );
}
