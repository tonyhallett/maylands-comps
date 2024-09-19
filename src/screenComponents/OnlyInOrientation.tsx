import { PropsWithChildren, ReactNode } from "react";
import { useOrientation } from "../hooks/useOrientation";

export type OnlyInOrientationProps = PropsWithChildren<{
  landscape?: boolean;
  wrongOrientation: ReactNode;
}>;

export function OnlyInOrientation({
  landscape = true,
  children,
  wrongOrientation,
}: OnlyInOrientationProps) {
  const portrait = useOrientation();
  if (landscape !== portrait) {
    return children;
  }
  return wrongOrientation;
}
