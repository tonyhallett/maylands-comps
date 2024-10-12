import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useRef, useState } from "react";
import ReactSignatureCanvas, {
  ReactSignatureCanvasProps,
} from "react-signature-canvas";
import SignatureCanvas from "react-signature-canvas";
import DrawIcon from "@mui/icons-material/Draw";
import { useIsPortrait } from "../../hooks/useIsPortrait";
import useWindowDimensions, {
  WindowDimensions,
} from "../../useWindowDimensions";
import { Size } from "../../commonTypes";
import SignaturePad from "signature_pad";

export interface TeamSignatureState {
  createSignature: boolean;
  trimmedCanvasSize?: Size;
}
type TeamSignatureCanvasProps = Omit<
  ReactSignatureCanvasProps,
  "canvasProps"
> & {
  canvasProps?: Omit<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    "width" | "height"
  >;
};
type TeamSignatureCanvasPropsOrCalcFunction =
  | TeamSignatureCanvasProps
  | ((canvasSize: Size) => TeamSignatureCanvasProps);
export interface TeamSignatureProps {
  isHome: boolean;
  useTrimmedSize?: boolean;
  getDisplaySize: (canvasSize: Size) => Size;
  // if minWith and maxWidth are undefined they will be calculated from the canvas size
  signatureCanvasProps?: TeamSignatureCanvasPropsOrCalcFunction;
  dataUrl: string | undefined;
  addedSignature: (
    dataUrl: string,
    points: SignaturePad.Point[][],
    canvasSize: Size,
    minWidth: number,
    maxWidth: number,
    isHome: boolean,
  ) => void;
  addSignatureEnabled: boolean;
}

export const calculateFullscreenLandscapeDialogCanvasSize = (
  windowDimensions: WindowDimensions,
  isPortrait: boolean,
): Size => {
  let landscapeSize: Size;
  if (document.fullscreenEnabled) {
    if (isPortrait) {
      landscapeSize = {
        width: windowDimensions.outerHeight,
        height: windowDimensions.outerWidth,
      };
    } else {
      landscapeSize = {
        width: windowDimensions.outerWidth,
        height: windowDimensions.outerHeight,
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

export const getSignatureCanvasProps = (
  signatureCanvasProps: TeamSignatureCanvasPropsOrCalcFunction,
  canvasSize: Size,
) => {
  let teamSignatureCanvasProps: TeamSignatureCanvasProps;
  if (signatureCanvasProps instanceof Function) {
    teamSignatureCanvasProps = signatureCanvasProps(canvasSize);
  } else {
    teamSignatureCanvasProps = signatureCanvasProps;
  }

  const reactSignatureCanvasProps: ReactSignatureCanvasProps = {
    ...teamSignatureCanvasProps,
    canvasProps: {
      ...teamSignatureCanvasProps.canvasProps,
      width: canvasSize.width,
      height: canvasSize.height,
    },
  };
  if (
    reactSignatureCanvasProps.minWidth === undefined &&
    reactSignatureCanvasProps.maxWidth === undefined
  ) {
    const minWidth = canvasSize.height / 100;
    const maxWidth = minWidth * 1.5;
    reactSignatureCanvasProps.minWidth = minWidth;
    reactSignatureCanvasProps.maxWidth = maxWidth;
  }
  return reactSignatureCanvasProps;
};

export function TeamSignature({
  isHome,
  getDisplaySize,
  useTrimmedSize = true,
  signatureCanvasProps = {},
  addSignatureEnabled: showSigned,
  dataUrl,
  addedSignature,
}: TeamSignatureProps) {
  const scrollPositionRef = useRef<number | undefined>(undefined);
  const windowDimensions = useWindowDimensions();
  const isPortrait = useIsPortrait();
  const [state, setState] = useState<TeamSignatureState>({
    createSignature: false,
  });
  const sigCanvas = useRef<ReactSignatureCanvas | null>(null);

  const scrollback = () => {
    if (scrollPositionRef.current) {
      window.setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current!);
        scrollPositionRef.current = undefined;
      }, 100);
    }
  };
  const canvasSize = calculateFullscreenLandscapeDialogCanvasSize(
    windowDimensions,
    isPortrait,
  );

  const displaySize = getDisplaySize(state.trimmedCanvasSize || canvasSize);

  const actualSignatureCanvasProps = getSignatureCanvasProps(
    signatureCanvasProps,
    canvasSize,
  );
  const title = `${isHome ? "Home" : "Away"} Signature`;
  const close = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      scrollback();
    }
    setState({
      createSignature: false,
    });
  };

  return (
    <>
      <>
        <IconButton
          disabled={!showSigned}
          onClick={() => {
            if (document.fullscreenEnabled) {
              scrollPositionRef.current = window.scrollY;
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
        <span className="teamLabelAndSignature">
          <span
            style={{ marginRight: 5 }}
          >{`${isHome ? "Home" : "Away"} :`}</span>
          {dataUrl ? (
            <img
              id={`${isHome ? "home" : "away"}Signature`}
              src={dataUrl}
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
        </span>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!isPortrait && (
            <Button
              onClick={() => {
                sigCanvas.current!.clear();
              }}
            >
              Clear
            </Button>
          )}

          {!isPortrait && (
            <Button
              onClick={() => {
                if (document.fullscreenElement) {
                  scrollback();
                  document.exitFullscreen();
                }
                let dataUrl: string;
                let trimmedCanvasSize: Size | undefined;
                const data = sigCanvas.current!.toData();
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

                addedSignature(
                  dataUrl,
                  data,
                  canvasSize,
                  actualSignatureCanvasProps.minWidth!,
                  actualSignatureCanvasProps.maxWidth!,
                  isHome,
                );
                setState((prevState) => {
                  const newState: TeamSignatureState = {
                    ...prevState,
                    createSignature: false,
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
          )}
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
