import { PropsWithChildren, ReactNode } from "react";
import { useIsFullscreen } from "../hooks/useIsFullscreen";

export type OnlyIfFullScreenOrNotAvailableProps = PropsWithChildren<{
  notfullScreen: ReactNode;
}>;
export function OnlyIfFullscreenOrNotAvailable({
  notfullScreen,
  children,
}: OnlyIfFullScreenOrNotAvailableProps) {
  const isFullscreen = useIsFullscreen();
  if (!document.fullscreenEnabled) {
    return children;
  }
  if (isFullscreen) {
    return children;
  }
  return notfullScreen;
}
