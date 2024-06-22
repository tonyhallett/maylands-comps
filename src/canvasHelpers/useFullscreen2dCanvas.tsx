import { useEffect, useRef } from "react";
import { fixCanvasHighRes } from "../fontDemos/fixCanvasHighRes";

export function useFullscreen2dCanvas(
  canvasCallback: (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ) => void,
) {
  const setUp = useRef(false);
  const inputRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = inputRef.current;
    const context = canvas.getContext("2d");
    if (!setUp.current) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (!setUp.current) {
        fixCanvasHighRes(canvas, context);
        setUp.current = true;
      }
    }
    canvasCallback(canvas, context);
  }, [canvasCallback]);
  useEffect(() => {
    const onResize = () => {
      const canvas = inputRef.current;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const context = canvas.getContext("2d");
      fixCanvasHighRes(canvas, context);
      canvasCallback(canvas, context);
    };
    window.onresize = onResize;
    return () => {
      window.onresize = null;
    };
  }, [canvasCallback]);
  return <canvas style={{ display: "block" }} ref={inputRef} />;
}
