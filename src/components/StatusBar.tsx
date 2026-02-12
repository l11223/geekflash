import { Usb, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type DeviceMode = "edl" | "fastboot" | "disconnected";

interface StatusBarProps {
  mode: DeviceMode;
}

const statusConfig: Record<DeviceMode, { label: string; icon: typeof Usb; className: string }> = {
  edl: {
    label: "EDL 设备已连接",
    icon: Usb,
    className: "bg-green-600 text-white hover:bg-green-600",
  },
  fastboot: {
    label: "Fastboot 设备已连接",
    icon: Wifi,
    className: "bg-yellow-600 text-white hover:bg-yellow-600",
  },
  disconnected: {
    label: "未检测到设备",
    icon: WifiOff,
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
};

export function StatusBar({ mode }: StatusBarProps) {
  const config = statusConfig[mode];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <span className="text-sm font-semibold text-foreground">GeekFlash</span>
      <Badge className={config.className}>
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {config.label}
      </Badge>
    </div>
  );
}
