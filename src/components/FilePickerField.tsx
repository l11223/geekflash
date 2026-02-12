import { FolderOpen, FileCheck } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";

export interface FileFilter {
  name: string;
  extensions: string[];
}

interface FilePickerFieldProps {
  label: string;
  value: string | null;
  filters?: FileFilter[];
  onChange: (path: string | null) => void;
}

export function FilePickerField({
  label,
  value,
  filters,
  onChange,
}: FilePickerFieldProps) {
  const handleBrowse = async () => {
    const selected = await open({ multiple: false, filters });
    if (selected) {
      onChange(selected as string);
    }
  };

  const hasValue = !!value;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-2">
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-sm ${
            hasValue
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "border-border/50 bg-secondary/30 text-muted-foreground/50"
          }`}
        >
          {hasValue && (
            <FileCheck className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          )}
          <span className="truncate">
            {value || "未选择文件"}
          </span>
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={handleBrowse}
          className="border-border/50 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all"
        >
          <FolderOpen className="mr-1.5 h-4 w-4" />
          浏览
        </Button>
      </div>
    </div>
  );
}
