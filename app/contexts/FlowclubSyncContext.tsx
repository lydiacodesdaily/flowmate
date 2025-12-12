"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FlowclubPayload, FlowclubSyncState } from "../types";
import { isFlowclubSyncMessage, parseFlowclubPayload, isPayloadStale } from "../utils/flowclub";

interface FlowclubSyncContextValue extends FlowclubSyncState {
  setSyncEnabled: (enabled: boolean) => void;
  isFlowClubDetected: boolean;
}

const FlowclubSyncContext = createContext<FlowclubSyncContextValue | undefined>(undefined);

export function FlowclubSyncProvider({ children }: { children: ReactNode }) {
  const [isFlowClubDetected, setIsFlowClubDetected] = useState(false);
  const [syncState, setSyncState] = useState<FlowclubSyncState>({
    isSynced: false,
    lastPayload: null,
    isStale: false,
    updatedAt: null,
  });

  useEffect(() => {
    // Load Flow Club detection from localStorage
    if (typeof window !== "undefined") {
      const detected = localStorage.getItem("flowclubDetected") === "true";
      setIsFlowClubDetected(detected);

      // Only enable sync if Flow Club was previously detected
      const savedSyncEnabled = localStorage.getItem("flowclubSyncEnabled") === "true";
      setSyncState((prev) => ({ ...prev, isSynced: detected && savedSyncEnabled }));
    }
  }, []);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!isFlowclubSyncMessage(e)) return;

      const payload = parseFlowclubPayload(e.data.payload);
      if (!payload) return;

      // Detect Flow Club on first valid message
      if (!isFlowClubDetected) {
        setIsFlowClubDetected(true);
        localStorage.setItem("flowclubDetected", "true");

        // Auto-enable sync on first detection
        localStorage.setItem("flowclubSyncEnabled", "true");
      }

      // Always update payload when received (if sync is enabled)
      const syncEnabled = localStorage.getItem("flowclubSyncEnabled") === "true";
      if (syncEnabled) {
        setSyncState({
          isSynced: true,
          lastPayload: payload,
          isStale: isPayloadStale(payload.flowclubTimerUpdatedAt),
          updatedAt: Date.now(),
        });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isFlowClubDetected]);

  // Check for stale data periodically
  useEffect(() => {
    if (!syncState.isSynced || !syncState.lastPayload) return;

    const interval = setInterval(() => {
      if (syncState.lastPayload) {
        const isStale = isPayloadStale(syncState.lastPayload.flowclubTimerUpdatedAt);
        if (isStale !== syncState.isStale) {
          setSyncState((prev) => ({ ...prev, isStale }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [syncState.isSynced, syncState.lastPayload, syncState.isStale]);

  const setSyncEnabled = (enabled: boolean) => {
    setSyncState((prev) => ({
      ...prev,
      isSynced: enabled,
      lastPayload: enabled ? prev.lastPayload : null,
      isStale: false,
      updatedAt: enabled ? prev.updatedAt : null,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("flowclubSyncEnabled", String(enabled));
    }
  };

  return (
    <FlowclubSyncContext.Provider value={{ ...syncState, setSyncEnabled, isFlowClubDetected }}>
      {children}
    </FlowclubSyncContext.Provider>
  );
}

export function useFlowclubSync() {
  const context = useContext(FlowclubSyncContext);
  if (context === undefined) {
    throw new Error("useFlowclubSync must be used within a FlowclubSyncProvider");
  }
  return context;
}
