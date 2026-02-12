import { useState } from "react";
import { LogPanel } from "@/components/LogPanel";
import { FlashBootTab } from "@/components/FlashBootTab";
import { RestoreBootTab } from "@/components/RestoreBootTab";
import { GptFixTab } from "@/components/GptFixTab";
import { AvbSignTab } from "@/components/AvbSignTab";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useLogStream } from "@/hooks/useLogStream";
import { useConfig } from "@/hooks/useConfig";
import { useActionValidation } from "@/hooks/useActionValidation";
import { Zap, RotateCcw, HardDrive, Shield, Usb, WifiOff, Wifi } from "lucide-react";

type TabId = "flash-boot" | "restore-boot" | "gpt-fix" | "avb-sign";

const tabs: { id: TabId; label: string; icon: typeof Zap }[] = [
  { id: "flash-boot", label: "刷入 Boot", icon: Zap },
  { id: "restore-boot", label: "恢复 Boot", icon: RotateCcw },
  { id: "gpt-fix", label: "GPT 修复", icon: HardDrive },
  { id: "avb-sign", label: "AVB 签名", icon: Shield },
];

const deviceIcons = { edl: Usb, fastboot: Wifi, disconnected: WifiOff };
const deviceLabels = {
  edl: "EDL 已连接",
  fastboot: "Fastboot",
  disconnected: "等待连接",
};
const deviceColors = {
  edl: "bg-emerald-400",
  fastboot: "bg-amber-400",
  disconnected: "bg-zinc-600",
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("flash-boot");
  const deviceStatus = useDeviceStatus();
  const { logs, clearLogs } = useLogStream();
  const { config, updateConfig } = useConfig();
  const validation = useActionValidation(config);

  const DevIcon = deviceIcons[deviceStatus.mode];
  const isConnected = deviceStatus.mode !== "disconnected";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="sidebar flex flex-col w-[200px] flex-shrink-0">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/12 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-[13px] font-semibold brand-text leading-tight">
                GeekFlash
              </div>
              <div className="text-[10px] text-muted-foreground/50 leading-tight mt-0.5">
                Y700 Gen4
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <div className="section-label px-3 mb-2">功能</div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="nav-icon" />
                <span>{tab.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Device status */}
        <div className="px-4 pb-4">
          <div className="section-label px-0 mb-2">设备</div>
          <div className="flex items-center gap-2 px-1">
            <span
              className={`status-dot ${deviceColors[deviceStatus.mode]} ${isConnected ? "connected" : ""}`}
            />
            <DevIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/70">
              {deviceLabels[deviceStatus.mode]}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {config && (
            <>
              {activeTab === "flash-boot" && (
                <FlashBootTab
                  config={config}
                  updateConfig={updateConfig}
                  validation={validation}
                />
              )}
              {activeTab === "restore-boot" && (
                <RestoreBootTab
                  config={config}
                  updateConfig={updateConfig}
                  validation={validation}
                />
              )}
              {activeTab === "gpt-fix" && (
                <GptFixTab
                  config={config}
                  updateConfig={updateConfig}
                  validation={validation}
                />
              )}
              {activeTab === "avb-sign" && (
                <AvbSignTab
                  config={config}
                  updateConfig={updateConfig}
                  validation={validation}
                />
              )}
            </>
          )}
        </div>

        {/* Log panel */}
        <LogPanel logs={logs} onClear={clearLogs} />
      </main>
    </div>
  );
}

export default App;
