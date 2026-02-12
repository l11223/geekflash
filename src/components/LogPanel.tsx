import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface LogLine {
  timestamp: string;
  stream: "stdout" | "stderr";
  content: string;
}

interface LogPanelProps {
  logs: LogLine[];
  onClear: () => void;
}

export function LogPanel({ logs, onClear }: LogPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col border-t border-border bg-card" style={{ height: 200 }}>
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">日志输出</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-0.5 font-mono text-xs">
          {logs.length === 0 && (
            <p className="text-muted-foreground">暂无日志</p>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 text-muted-foreground">{log.timestamp}</span>
              <span className={log.stream === "stderr" ? "text-orange-400" : "text-foreground"}>
                {log.content}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
