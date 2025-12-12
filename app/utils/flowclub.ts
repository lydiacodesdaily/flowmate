import { FlowclubPayload } from "../types";

export function isFlowclubSyncMessage(e: MessageEvent): boolean {
  return e?.data?.type === "FLOWCLUB_TIMER_SYNC";
}

export function parseFlowclubPayload(raw: any): FlowclubPayload | null {
  try {
    // Validate all required fields exist and have correct types
    if (
      typeof raw?.flowclubTimerSeconds !== "number" ||
      typeof raw?.flowclubTimerUpdatedAt !== "number" ||
      (raw?.flowclubSessionDurationMinutes !== null && typeof raw?.flowclubSessionDurationMinutes !== "number") ||
      (raw?.flowclubSessionTitle !== null && typeof raw?.flowclubSessionTitle !== "string") ||
      typeof raw?.flowclubCurrentSessionIndex !== "number" ||
      (raw?.flowclubCurrentSessionType !== "focus" && raw?.flowclubCurrentSessionType !== "break") ||
      typeof raw?.flowclubCompletedCount !== "number" ||
      (raw?.flowclubPhaseLabel !== null && typeof raw?.flowclubPhaseLabel !== "string") ||
      (raw?.flowclubSessionStyle !== null &&
       raw?.flowclubSessionStyle !== "pomodoro" &&
       raw?.flowclubSessionStyle !== "non_pomodoro") ||
      (raw?.flowclubCurrentBlock !== null && typeof raw?.flowclubCurrentBlock !== "number")
    ) {
      console.warn("Invalid Flow Club payload:", raw);
      return null;
    }

    return {
      flowclubTimerSeconds: raw.flowclubTimerSeconds,
      flowclubTimerUpdatedAt: raw.flowclubTimerUpdatedAt,
      flowclubSessionDurationMinutes: raw.flowclubSessionDurationMinutes,
      flowclubSessionTitle: raw.flowclubSessionTitle,
      flowclubCurrentSessionIndex: raw.flowclubCurrentSessionIndex,
      flowclubCurrentSessionType: raw.flowclubCurrentSessionType,
      flowclubCompletedCount: raw.flowclubCompletedCount,
      flowclubPhaseLabel: raw.flowclubPhaseLabel,
      flowclubSessionStyle: raw.flowclubSessionStyle,
      flowclubCurrentBlock: raw.flowclubCurrentBlock,
    };
  } catch (error) {
    console.error("Error parsing Flow Club payload:", error);
    return null;
  }
}

export function isPayloadStale(updatedAt: number, thresholdMs: number = 5000): boolean {
  return Date.now() - updatedAt > thresholdMs;
}
