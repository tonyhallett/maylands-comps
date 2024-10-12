import { drawCell } from "./drawCell";
import { CellInstruction } from "./getInstructions";
import { PenColors } from "../generateScorecard";

export function drawGameRowCells(
  rowInstructions: CellInstruction[],
  padding: number,
  penColors: PenColors,
  ctx: CanvasRenderingContext2D,
) {
  const maxHeight = Math.max(...rowInstructions.map((m) => m.height));
  const cellHeight = maxHeight + padding * 2;
  let shift = 0;
  rowInstructions.forEach((cellInstruction) => {
    if (cellInstruction.isEntry !== undefined) {
      shift = drawCell(
        ctx,
        penColors.title,
        cellInstruction,
        {
          height: cellHeight,
          width: cellInstruction.cellWidth,
        },

        cellInstruction.isEntry ? penColors.entry : penColors.title,
      );
    } else {
      shift = drawCell(
        ctx,
        penColors.title,
        cellInstruction,
        {
          height: cellHeight,
          width: cellInstruction.cellWidth,
        },

        cellInstruction.customDraw!,
      );
    }
  });
  return shift;
}
