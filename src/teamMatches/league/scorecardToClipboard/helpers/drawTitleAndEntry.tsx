import { fillTextWithColor } from "./fillTextWithColor";
import { PenColors } from "../generateScorecard";

export function drawTitleAndEntry(
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  positioning: {
    titleX: number;
    titleWidth: number;
    y: number;
    titleMarginRight: number;
  },
  title: {
    text: string;
    canvasFont: string;
  },
  entry: {
    text: string;
    canvasFont: string;
    maxWidth?: number;
  },
) {
  fillTextWithColor(
    ctx,
    title.text,
    positioning.titleX,
    positioning.y,
    penColors.title,
    title.canvasFont,
  );
  fillTextWithColor(
    ctx,
    entry.text,
    positioning.titleX + positioning.titleWidth + positioning.titleMarginRight,
    positioning.y,
    penColors.entry,
    entry.canvasFont,
    entry.maxWidth,
  );
}
