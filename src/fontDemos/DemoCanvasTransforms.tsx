import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";

function drawRect(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, 50, 50);
}

export function DemoCanvasTransforms() {
  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      context.reset();
      context.fillStyle = "orange";
      drawRect(context);

      // does not affect existing - but all after
      context.translate(100, 0);
      drawRect(context);

      context.translate(100, 0);
      drawRect(context);

      // does not affect existing
      context.resetTransform(); // cause issues when have scaled for high density display.................
      context.fillStyle = "yellow";
      drawRect(context);

      //context.resetTransform
      //context.translate
      //context.transform
      //context.getTransform
      //context.setTransform
      //context.transform
      context.getTransform();
    },
  );
  return canvas;
}
