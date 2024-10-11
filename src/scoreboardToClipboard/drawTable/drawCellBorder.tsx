import { Size } from "../../commonTypes";

export interface GridInstruction {
  gridLineSize: number;
  gridLineColor: string;
}

export function drawCellBorder(
  ctx: CanvasRenderingContext2D,
  gridInstruction: GridInstruction,
  cellSize: Size,
) {
  ctx.strokeStyle = gridInstruction.gridLineColor;
  ctx.beginPath();
  const gridLineSize = gridInstruction.gridLineSize;
  ctx.lineWidth = gridLineSize;
  // incorporating the grid line in width but not height
  ctx.strokeRect(
    0,
    -gridLineSize / 2,
    cellSize.width,
    cellSize.height + gridLineSize,
  );
}
