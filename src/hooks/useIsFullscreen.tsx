import { useEffect, useState } from "react";

export function getIsFullscreen() {
  return document.fullscreenElement !== null;
}

export function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen());
  useEffect(() => {
    const listener = () => setIsFullscreen(getIsFullscreen());
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);
  return isFullscreen;
}
