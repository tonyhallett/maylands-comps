import { useEffect, useRef } from "react";
import { useIsFullscreen } from "./useIsFullscreen";

export function useExitFullscreenWhenMouseMoves(delay = 1000) {
  const isFullscreen = useIsFullscreen();
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    const mouseMoveListener = () => {
      // should be no need for this
      if (isFullscreen) {
        document.exitFullscreen();
      }
    };

    if (document.fullscreenEnabled) {
      if (isFullscreen) {
        timeoutRef.current = window.setTimeout(() => {
          document.addEventListener("mousemove", mouseMoveListener);
        }, delay);
      } else {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        document.removeEventListener("mousemove", mouseMoveListener);
      }
    }

    return () => {
      if (document.fullscreenEnabled) {
        document.removeEventListener("mousemove", mouseMoveListener);
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };
  }, [isFullscreen, delay]);
}
