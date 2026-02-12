import { StatusBar } from "@/components/StatusBar";
import { LogPanel } from "@/components/LogPanel";
import { FlashBootTab } from "@/components/FlashBootTab";
import { RestoreBootTab } from "@/components/RestoreBootTab";
import { GptFixTab } from "@/components/GptFixTab";
import { AvbSignTab } from "@/components/AvbSignTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useLogStream } from "@/hooks/useLogStream";
import { useConfig } from "@/hooks/useConfig";
import { useActionValidation } from "@/hooks/useActionValidation";
import { Zap, RotateCcw, HardDrive, Shield } from "lucide-react";

function App() {
  const deviceStatus = useDeviceStatus();
  const { logs, clearLogs } = useLogStream();
  const { config, updateConfig } = useConfig();
  const validation = useActionValidation(config);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top bar with subtle gradient */}
      <StatusBar mode={deviceStatus.mode} />

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="flash-boot" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab navigation */}
          <div className="px-6 pt-4 pb-0">
            <TabsList className="w-full bg-secondary/40 border border-border/50 p-1 rounded-xl h-auto gap-1">
              <TabsTrigger
                value="flash-boot"
                className="flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <Zap className="mr-2 h-4 w-4" />
                刷入 Boot
              </TabsTrigger>
              <TabsTrigger
                value="restore-boot"
                className="flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                恢复 Boot
              </TabsTrigger>
              <TabsTrigger
                value="gpt-fix"
                className="flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <HardDrive className="mr-2 h-4 w-4" />
                GPT 修复
              </TabsTrigger>
              <TabsTrigger
                value="avb-sign"
                className="flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <Shield className="mr-2 h-4 w-4" />
                AVB 签名
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {config && (
              <>
                <TabsContent value="flash-boot" className="mt-0 h-full">
                  <FlashBootTab config={config} updateConfig={updateConfig} validation={validation} />
                </TabsContent>
                <TabsContent value="restore-boot" className="mt-0 h-full">
                  <RestoreBootTab config={config} updateConfig={updateConfig} validation={validation} />
                </TabsContent>
                <TabsContent value="gpt-fix" className="mt-0 h-full">
                  <GptFixTab config={config} updateConfig={updateConfig} validation={validation} />
                </TabsContent>
                <TabsContent value="avb-sign" className="mt-0 h-full">
                  <AvbSignTab config={config} updateConfig={updateConfig} validation={validation} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* Log panel */}
      <LogPanel logs={logs} onClear={clearLogs} />
    </div>
  );
}

export default App;
