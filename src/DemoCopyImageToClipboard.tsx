import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactSignatureCanvas, {
  ReactSignatureCanvasProps,
} from "react-signature-canvas";
import SignatureCanvas from "react-signature-canvas";
import DrawIcon from "@mui/icons-material/Draw";
import { useOrientation } from "./hooks/useOrientation";

interface Size {
  width: number;
  height: number;
}
interface SignatureState {
  createSignature: boolean;
  dataUrl: string | undefined;
  name: string;
  trimmedCanvasSize?: Size;
}

interface SignatureProps {
  isHome: boolean;
  useTrimmedSize?: boolean;
  getDisplaySize: (canvasSize: Size) => Size;
  signatureCanvasProps?: ReactSignatureCanvasProps; // todo omit the canvas size
}
type BothSignatureProps = Omit<SignatureProps, "isHome">;
export function DemoCopyImageToClipboard(props: BothSignatureProps) {
  return (
    <>
      <div style={{ margin: 10 }}>
        <TeamSignature {...props} isHome={true} />
      </div>
      <Divider />
      <div style={{ margin: 10 }}>
        <TeamSignature {...props} isHome={false} />
      </div>
    </>
  );
}
interface WindowDimensions {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}
export default function useWindowDimensions(): WindowDimensions {
  const getWindowDimensions = useCallback(() => {
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
    };
  }, []);

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getWindowDimensions]);

  return windowDimensions;
}
document.addEventListener("fullscreenchange", () => {
  const isFullScreen = !!document.fullscreenElement;
  console.log(`fullscreenchange ${isFullScreen}`);
});
document.addEventListener("fullscreenerror", () => {
  alert("fullscreenerror");
});

//const deviceCanRotate = "DeviceOrientationEvent" in window;

/*
  really simplify - mainly needs to be workable on mobile
  always fullscreen dialog
  if portrait then require landscape
  take into account padding and margin

*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const calculateFullscreenLandscapeDialogCanvasSize = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  windowDimensions: WindowDimensions,
  isPortrait: boolean,
): Size => {
  let landscapeSize: Size;
  if (document.fullscreenEnabled) {
    if (isPortrait) {
      landscapeSize = {
        width: screen.height,
        height: screen.width,
      };
    } else {
      landscapeSize = {
        width: screen.width,
        height: screen.height,
      };
    }
  } else {
    if (isPortrait) {
      landscapeSize = {
        width: windowDimensions.innerHeight,
        height: windowDimensions.innerWidth,
      };
    } else {
      landscapeSize = {
        width: windowDimensions.innerWidth,
        height: windowDimensions.innerHeight,
      };
    }
  }

  //const dialogTitleTopBottomPadding = 16;
  //const typographyH6VariantHeight = ? is 1.25rem
  // calculated as 64px
  //const dialogTitleHeight =     dialogTitleTopBottomPadding * 2 + typographyH6VariantHeight;
  const dialogTitleCalculatedHeight = 64;

  //const dialogActionPaddingTopBottom = 8; // padding: '6px 8px', variant text
  //const buttonHeight = 36; //calculated as 36.5px
  //const dialogActionHeight = dialogActionPadding * 2 + buttonHeight;
  const dialogActionCalculatedHeight = 53; // calculated as 52.5 px

  const dialogContentLeftRightPadding = 24;
  const dialogContentTopBottomPadding = 16; // where did I get 20 from

  const wiggleRoomWidth = 4;
  const wiggleRoomHeight = 6; // remember that dev tools adds a pixel !

  return {
    width:
      landscapeSize.width - dialogContentLeftRightPadding * 2 - wiggleRoomWidth,

    height:
      landscapeSize.height -
      dialogContentTopBottomPadding * 2 -
      dialogTitleCalculatedHeight -
      dialogActionCalculatedHeight -
      wiggleRoomHeight,
  };
};
export function TeamSignature({
  isHome,
  getDisplaySize,
  useTrimmedSize = true,
  signatureCanvasProps = {},
}: SignatureProps) {
  const windowDimensions = useWindowDimensions();
  const isPortrait = useOrientation();
  const [state, setState] = useState<SignatureState>({
    createSignature: false,
    dataUrl: undefined,
    name: "",
  });
  const sigCanvas = useRef<ReactSignatureCanvas | null>(null);
  const canvasSize = calculateFullscreenLandscapeDialogCanvasSize(
    windowDimensions,
    isPortrait,
  );

  const displaySize = getDisplaySize(state.trimmedCanvasSize || canvasSize);
  // these should be returned by getDisplaySize ?
  const minWidth = canvasSize.height / 100;
  const maxWidth = minWidth * 1.5;
  const actualSignatureCanvasProps: ReactSignatureCanvasProps = {
    ...signatureCanvasProps,
    minWidth,
    maxWidth,
    canvasProps: {
      ...signatureCanvasProps.canvasProps,
      width: canvasSize.width,
      height: canvasSize.height,
    },
  };
  const title = `${isHome ? "Home" : "Away"} Signature`;
  const close = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setState((prevState) => {
      const newState: SignatureState = {
        createSignature: false,
        dataUrl: undefined,
        name: prevState.name,
      };
      return newState;
    });
  };

  return (
    <>
      <>
        <IconButton
          onClick={() => {
            if (document.fullscreenEnabled) {
              document.body.requestFullscreen();
            }
            setState((prevState) => ({
              ...prevState,
              createSignature: true,
              dataUrl: undefined,
            }));
          }}
        >
          <DrawIcon />
        </IconButton>
        <span
          style={{ marginRight: 5 }}
        >{`${isHome ? "Home" : "Away"} :`}</span>
        {state.dataUrl ? (
          <img
            src={state.dataUrl}
            width={displaySize.width}
            height={displaySize.height}
          />
        ) : (
          <span
            style={{
              width: displaySize.width,
              height: displaySize.height,
              display: "inline-block",
            }}
          ></span>
        )}

        <div style={{ marginLeft: 5, whiteSpace: "preserve" }}>
          {state.name.length > 0 ? state.name : "    "}
        </div>
      </>

      <Dialog onClose={close} fullScreen={true} open={state.createSignature}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          {isPortrait ? (
            <div>Landscape please</div>
          ) : (
            <>
              <SignatureCanvas
                ref={(ref) => {
                  sigCanvas.current = ref;
                }}
                {...actualSignatureCanvasProps}
              />
              {/* <TextField
                sx={{ marginTop: 1 }}
                label="Name"
                value={state.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setState((prevState) => ({
                    ...prevState,
                    name: event.target.value,
                  }));
                }}
              /> */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              sigCanvas.current!.clear();
            }}
          >
            Clear
          </Button>
          <Button onClick={close}>Close</Button>
          <Button
            disabled={isPortrait}
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
              let dataUrl: string;
              let trimmedCanvasSize: Size | undefined;
              if (useTrimmedSize) {
                const trimmedCanvas = sigCanvas.current!.getTrimmedCanvas();
                dataUrl = trimmedCanvas.toDataURL();
                trimmedCanvasSize = {
                  width: trimmedCanvas.width,
                  height: trimmedCanvas.height,
                };
              } else {
                dataUrl = sigCanvas.current!.toDataURL();
              }

              setState((prevState) => {
                const newState: SignatureState = {
                  ...prevState,
                  createSignature: false,
                  dataUrl,
                };
                if (trimmedCanvasSize) {
                  newState.trimmedCanvasSize = trimmedCanvasSize;
                }
                return newState;
              });
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
