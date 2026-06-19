import { useEffect, useState } from "react";

const WAKE_MESSAGE =
  "Please bear with me while I awaken our sleeping cloud resources.";

type SupabaseWakeStatus = "checking" | "active" | "restoring" | "unavailable";

type SupabaseWakeResponse = {
  status?: string;
  message?: string;
  progress?: number;
};

type SupabaseWakeState = {
  status: SupabaseWakeStatus;
  message: string;
  progress: number;
  isBlocking: boolean;
};

function clampProgress(progress: unknown) {
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return 25;
  }
  return Math.max(0, Math.min(100, progress));
}

function normalizeWakeState(data: SupabaseWakeResponse): SupabaseWakeState {
  if (data.status === "active") {
    return {
      status: "active",
      message: "",
      progress: 100,
      isBlocking: false,
    };
  }

  if (data.status === "restoring" || data.status === "checking") {
    return {
      status: "restoring",
      message: data.message || WAKE_MESSAGE,
      progress: clampProgress(data.progress),
      isBlocking: true,
    };
  }

  return {
    status: "unavailable",
    message: "",
    progress: 100,
    isBlocking: false,
  };
}

export function useSupabaseWakeStatus(): SupabaseWakeState {
  const [wakeState, setWakeState] = useState<SupabaseWakeState>({
    status: "checking",
    message: "Checking cloud resources...",
    progress: 10,
    isBlocking: true,
  });

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function checkStatus() {
      try {
        const response = await fetch("/.netlify/functions/supabase-status", {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Supabase status check failed: ${response.status}`);
        }

        const nextState = normalizeWakeState(await response.json());
        if (cancelled) {
          return;
        }

        setWakeState(nextState);
        if (nextState.isBlocking) {
          retryTimer = setTimeout(checkStatus, 2500);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setWakeState({
            status: "unavailable",
            message: "",
            progress: 100,
            isBlocking: false,
          });
        }
      }
    }

    // oxlint-disable-next-line no-floating-promises
    checkStatus();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  return wakeState;
}
