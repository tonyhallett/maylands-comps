import { OnlyInOrientation, OnlyInOrientationProps } from "./OnlyInOrientation";
import {
  FullScreenWithMouseExit,
  FullScreenWithMouseExitProps,
} from "./FullScreenWithMouseExit";
import { PropsWithChildren } from "react";

export type LandscapeFullScreenWithMouseExitProps = PropsWithChildren<
  Pick<OnlyInOrientationProps, "wrongOrientation"> &
    Pick<FullScreenWithMouseExitProps, "delay" | "notfullScreen">
>;

export function LandscapeFullScreenWithMouseExit({
  wrongOrientation,
  notfullScreen,
  delay,
  children,
}: LandscapeFullScreenWithMouseExitProps) {
  return (
    <OnlyInOrientation wrongOrientation={wrongOrientation}>
      <FullScreenWithMouseExit notfullScreen={notfullScreen} delay={delay}>
        {children}
      </FullScreenWithMouseExit>
    </OnlyInOrientation>
  );
}
