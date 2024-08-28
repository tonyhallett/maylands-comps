import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { OnlyInOrientation, OnlyInOrientationProps } from "./OnlyInOrientation";
import { IconButton, Typography } from "@mui/material";

function getIsFullscreen() {
  return document.fullscreenElement !== null;
}

function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen());
  useEffect(() => {
    const listener = () => setIsFullscreen(getIsFullscreen());
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);
  return isFullscreen;
}

function useExitFullscreenWhenMouseMoves(delay = 1000) {
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

type FullScreenWithMouseExitProps = OnlyIfFullScreenOrNotAvailableProps & {
  delay?: number;
};
export function FullScreenWithMouseExit(props: FullScreenWithMouseExitProps) {
  useExitFullscreenWhenMouseMoves(props.delay);
  return <OnlyIfFullscreenOrNotAvailable {...props} />;
}

interface GoFullScreenProps {
  moveMouseToExit?: boolean;
}
export function GoFullScreen({ moveMouseToExit = false }: GoFullScreenProps) {
  return (
    <>
      <Typography display={"inline"}>
        {"Let's go full screen. Click !"}
      </Typography>
      <IconButton
        onClick={() => {
          document.body.requestFullscreen();
        }}
      >
        <FullscreenIcon />
      </IconButton>
      {moveMouseToExit && (
        <Typography>{"Touch the screen or move mouse to exit"}</Typography>
      )}
    </>
  );
}

type LandscapeFullScreenWithMouseExitProps = PropsWithChildren<
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
type LandscapeFullScreenProps = Pick<
  OnlyInOrientationProps,
  "wrongOrientation"
> &
  OnlyIfFullScreenOrNotAvailableProps;
export function LandscapeFullScreen({
  wrongOrientation,
  notfullScreen,
  children,
}: LandscapeFullScreenProps) {
  return (
    <OnlyInOrientation wrongOrientation={wrongOrientation}>
      <OnlyIfFullscreenOrNotAvailable notfullScreen={notfullScreen}>
        {children}
      </OnlyIfFullscreenOrNotAvailable>
    </OnlyInOrientation>
  );
}

export function LandscapeFullScreenWithMouseExitDemo() {
  return (
    <LandscapeFullScreenWithMouseExit
      wrongOrientation={<Typography>Landscape please</Typography>}
      notfullScreen={<GoFullScreen moveMouseToExit />}
      delay={1000}
    >
      <div>Full screen baby</div>
    </LandscapeFullScreenWithMouseExit>
  );
}

type OnlyIfFullScreenOrNotAvailableProps = PropsWithChildren<{
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
