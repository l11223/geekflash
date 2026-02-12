import { useMemo } from "react";
import type { AppConfig } from "@/types";

export interface ActionValidation {
  canFlashBoot: boolean;
  canRestoreBoot: boolean;
  canFixGpt: boolean;
  canSignAvb: boolean;
}

/** Pure validation function — also exported for direct testing */
export function validateActions(config: AppConfig): ActionValidation {
  return {
    canFlashBoot:
      config.patched_boot_img != null && config.firehose_loader != null,
    canRestoreBoot:
      config.stock_boot_img != null && config.firehose_loader != null,
    canFixGpt:
      config.gpt_main_bin != null &&
      config.gpt_backup_bin != null &&
      config.firehose_loader != null,
    canSignAvb:
      config.patched_boot_img != null &&
      config.avbtool_path != null &&
      config.avb_key_path != null,
  };
}

export function useActionValidation(
  config: AppConfig | null,
): ActionValidation {
  return useMemo(() => {
    if (!config) {
      return {
        canFlashBoot: false,
        canRestoreBoot: false,
        canFixGpt: false,
        canSignAvb: false,
      };
    }
    return validateActions(config);
  }, [config]);
}
