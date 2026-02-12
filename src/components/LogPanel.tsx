import { useEffect, useRef } from "react";
import { Trash2, Terminal } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col border-t border-border/60" style={{ height: 160 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-8 flex-shrink-0 bg-[hsl(228_22%_10%)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-muted-foreground/40" />
          <span className="section-label" style={{ marginBottom: 0 }}>
            终端
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] tabular-nums text-muted-foreground/30">
              {logs.length}
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto px-4 py-1.5 bg-[hsl(228_24%_7%)]"
      >
        <div className="font-mono text-[11px] leading-[1.6]">
          {logs.length === 0 && (
            <div className="text-muted-foreground/25 py-2">
              等待操作...
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 log-row px-1.5 py-px rounded-sm">
              <span className="shrink-0 text-muted-foreground/25 tabular-nums select-none">
                {log.timestamp}
              </span>
              <span
                className={
                  log.stream === "stderr"
                    ? "text-amber-500/80"
                    : "text-foreground/60"
                }
              >
                {log.content}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
