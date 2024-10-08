import { PropsWithChildren, ReactNode } from "react";
import { useIsPortrait } from "../hooks/useIsPortrait";

export type OnlyInOrientationProps = PropsWithChildren<{
  landscape?: boolean;
  wrongOrientation: ReactNode;
}>;

export function OnlyInOrientation({
  landscape = true,
  children,
  wrongOrientation,
}: OnlyInOrientationProps) {
  const portrait = useIsPortrait();
  if (landscape !== portrait) {
    return children;
  }
  return wrongOrientation;
}
