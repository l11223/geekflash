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

function App() {
  const deviceStatus = useDeviceStatus();
  const { logs, clearLogs } = useLogStream();
  const { config, updateConfig } = useConfig();
  const validation = useActionValidation(config);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <StatusBar mode={deviceStatus.mode} />

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="flash-boot" className="h-full flex flex-col">
          <TabsList className="w-fit">
            <TabsTrigger value="flash-boot">刷入 Boot</TabsTrigger>
            <TabsTrigger value="restore-boot">恢复 Boot</TabsTrigger>
            <TabsTrigger value="gpt-fix">GPT 修复</TabsTrigger>
            <TabsTrigger value="avb-sign">AVB 签名</TabsTrigger>
          </TabsList>

          {config && (
            <>
              <TabsContent value="flash-boot" className="flex-1">
                <FlashBootTab config={config} updateConfig={updateConfig} validation={validation} />
              </TabsContent>
              <TabsContent value="restore-boot" className="flex-1">
                <RestoreBootTab config={config} updateConfig={updateConfig} validation={validation} />
              </TabsContent>
              <TabsContent value="gpt-fix" className="flex-1">
                <GptFixTab config={config} updateConfig={updateConfig} validation={validation} />
              </TabsContent>
              <TabsContent value="avb-sign" className="flex-1">
                <AvbSignTab config={config} updateConfig={updateConfig} validation={validation} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <LogPanel logs={logs} onClear={clearLogs} />
    </div>
  );
}

export default App;
