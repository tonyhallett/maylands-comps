import { useRef, useEffect } from "react";
import { isTestEnvironment } from "../helpers/environment";
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
    } else {
      if (!isTestEnvironment()) {
        alert("Wake lock not supported");
      }
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
