import { FileCheck, FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

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
    <div className="space-y-1.5">
      <label className="section-label">{label}</label>
      <div className="flex gap-2">
        <div className={`file-field flex-1 ${hasValue ? "has-file" : ""}`}>
          {hasValue && (
            <FileCheck className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
          )}
          <span className="truncate">{value || "未选择文件"}</span>
        </div>
        <button className="file-field-btn" onClick={handleBrowse}>
          <FolderOpen className="w-3.5 h-3.5" />
          浏览
        </button>
      </div>
    </div>
  );
}
