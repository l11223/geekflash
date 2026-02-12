import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import type { DeviceStatus } from "@/types";

export function useDeviceStatus() {
  const [status, setStatus] = useState<DeviceStatus>({
    mode: "disconnected",
    timestamp: Date.now(),
  });

  useEffect(() => {
    const unlisten = listen<DeviceStatus>("device-status", (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return status;
}
