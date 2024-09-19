import { useExitFullscreenWhenMouseMoves } from "../hooks/useExitFullscreenWhenMouseMoves";
import {
  OnlyIfFullScreenOrNotAvailableProps,
  OnlyIfFullscreenOrNotAvailable,
} from "./OnlyIfFullScreenOrNotAvailable";

export type FullScreenWithMouseExitProps =
  OnlyIfFullScreenOrNotAvailableProps & {
    delay?: number | undefined;
  };

export function FullScreenWithMouseExit(props: FullScreenWithMouseExitProps) {
  useExitFullscreenWhenMouseMoves(props.delay);
  return <OnlyIfFullscreenOrNotAvailable {...props} />;
}
