import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Input } from "@/components/ui/input";
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
    const selected = await open({
      multiple: false,
      filters: filters,
    });
    if (selected) {
      onChange(selected as string);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          readOnly
          value={value ?? ""}
          placeholder="未选择文件"
          className="flex-1 cursor-default"
        />
        <Button variant="outline" size="default" onClick={handleBrowse}>
          <FolderOpen className="mr-1.5 h-4 w-4" />
          浏览
        </Button>
      </div>
    </div>
  );
}
