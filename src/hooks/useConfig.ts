import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AppConfig } from "@/types";

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<AppConfig>("cmd_load_config")
      .then((cfg) => {
        setConfig(cfg);
        setError(null);
      })
      .catch((err) => {
        setError(String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateConfig = useCallback(
    async (patch: Partial<AppConfig>) => {
      if (!config) return;
      const updated = { ...config, ...patch };
      setConfig(updated);
      try {
        await invoke("cmd_save_config", { config: updated });
        setError(null);
      } catch (err) {
        setError(String(err));
      }
    },
    [config],
  );

  return { config, loading, error, updateConfig };
}
