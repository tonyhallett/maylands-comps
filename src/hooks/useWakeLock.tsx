import { useRef, useEffect } from "react";

export function useWakeLock() {
  const wakeLockSupportedRef = useRef("wakeLock" in navigator);
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    if (wakeLockSupportedRef.current) {
      navigator.wakeLock
        .request("screen")
        .then((wakeLockSentinel) => {
          wakeLockSentinelRef.current = wakeLockSentinel;
        })
        .catch((e) => console.log("Wake lock request failed", e));
    }
    return () => {
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current
          .release()
          .catch((e) => console.log("Wake lock release failed", e));
      }
    };
  }, []);
}
