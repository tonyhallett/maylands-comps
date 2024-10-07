import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactSignatureCanvas, {
  ReactSignatureCanvasProps,
} from "react-signature-canvas";
import SignatureCanvas from "react-signature-canvas";
import DrawIcon from "@mui/icons-material/Draw";

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
  signatureCanvasProps?: ReactSignatureCanvasProps;
  canvasSize: Size;
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
export default function useWindowDimensions() {
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
export function TeamSignature({
  isHome,
  getDisplaySize,
  useTrimmedSize = true,
  signatureCanvasProps = {},
  canvasSize,
}: SignatureProps) {
  // padding on the dialog content - believe is 24px left and right
  // margin 32px when not full screen
  const { innerWidth, innerHeight, outerWidth, outerHeight } =
    useWindowDimensions();
  let requiresLandscape = false;
  let requiresFullscreen = false;
  // need to also calculate additional dialog settings
  if (canvasSize.width > innerWidth) {
    if (canvasSize.width < outerWidth) {
      requiresFullscreen = true;
    } else {
      requiresLandscape = true;
      if (canvasSize.width > innerHeight) {
        if (canvasSize.width < outerHeight) {
          requiresFullscreen = true;
        } else {
          requiresFullscreen = true;
          canvasSize = { ...canvasSize, width: outerHeight };
        }
      }
      // then need to check if requiresFullscreen
      // check if need to resize the canvas width to fit....
    }
  }
  /* const orientationTypeAndAngle = useOrientationTypeAndAngle();
  const changedOrientation =
    orientationTypeAndAngle.angle === 90 ||
    orientationTypeAndAngle.angle === 270; */

  const [state, setState] = useState<SignatureState>({
    createSignature: false,
    dataUrl: undefined,
    name: "",
  });
  const sigCanvas = useRef<ReactSignatureCanvas | null>(null);

  const displaySize = getDisplaySize(state.trimmedCanvasSize || canvasSize);
  const actualSignatureCanvasProps = {
    ...signatureCanvasProps,
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
  requiresFullscreen = true;
  return (
    <>
      <>
        <IconButton
          onClick={() => {
            if (requiresFullscreen) {
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
          {requiresLandscape ? (
            <div>Landscape please</div>
          ) : (
            <>
              <SignatureCanvas
                ref={(ref) => {
                  sigCanvas.current = ref;
                }}
                {...actualSignatureCanvasProps}
              />
              <TextField
                sx={{ marginTop: 1 }}
                label="Name"
                value={state.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setState((prevState) => ({
                    ...prevState,
                    name: event.target.value,
                  }));
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
          <Button
            disabled={requiresLandscape}
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
