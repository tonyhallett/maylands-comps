import { Button, CardContent } from "@mui/material";
import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";
import { DraggableCard } from "../demoHelpers/DraggableCard";
import { useState } from "react";

function drawRect(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, 50, 50);
}

export function DemoCanvasState() {
  const [count, setCount] = useState(0);
  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      if (count === 0) {
        context.fillStyle = "deeppink";
        drawRect(context);

        const fillStyles = ["yellow", "blue", "orange", "red"];
        fillStyles.forEach((fillStyle) => {
          context.fillStyle = fillStyle;
          context.translate(100, 0);
          context.save();
        });
        context.translate(100, 0);
        context.fillStyle = "lightgray";
        drawRect(context);
      } else {
        context.restore();
        drawRect(context);
      }
    },
  );
  return (
    <>
      {canvas}
      <DraggableCard cardStyle={{ position: "fixed", bottom: 10, right: 10 }}>
        <CardContent>
          <Button onClick={() => setCount(count + 1)}>Restore</Button>
        </CardContent>
      </DraggableCard>
    </>
  );
}
