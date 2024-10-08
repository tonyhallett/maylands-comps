import { useState, useEffect } from "react";
export function isPortrait() {
  return window.screen.orientation.type.startsWith("portrait");
}

export function useIsPortrait() {
  const [portrait, setPortrait] = useState<boolean>(isPortrait());
  useEffect(() => {
    const orientation = window.screen.orientation;
    const updatePortrait = () => {
      setPortrait(isPortrait());
    };
    orientation.addEventListener("change", updatePortrait);
    return () => orientation.removeEventListener("change", updatePortrait);
  }, []);
  return portrait;
}
