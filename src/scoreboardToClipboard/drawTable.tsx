import { FontFormat, PenColors } from "./generateScorecard";
import { getScorecardCanvasFont } from "./helpers/getCanvasFont";

type HeaderCell = Omit<Cell, "row">;
type RowCell = Omit<Cell, "header">;
interface CellMeasurements {
  height: number;
  textMetrics: TextMetrics;
  header: string;
  width: number;
  canvasFont: string;
  isEntry: boolean;
}

function measureCell(
  ctx: CanvasRenderingContext2D,
  header: string,
  fontFormat: FontFormat,
  fontFamily: string,
  width: number,
  isEntry?: boolean,
) {
  const canvasFont = getScorecardCanvasFont(fontFormat, fontFamily);
  ctx.font = canvasFont;
  const textMetrics = ctx.measureText(header);
  const height =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

  return {
    height,
    textMetrics,
    header,
    width,
    canvasFont,
    isEntry: isEntry === undefined ? true : isEntry,
  };
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  gridLineSize: number,
  gridLineColor: string,
  penColor: string,
  cellMeasurements: CellMeasurements,
  cellHeight: number,
) {
  const cellWidth = cellMeasurements.width;

  ctx.font = cellMeasurements.canvasFont;
  ctx.strokeStyle = gridLineColor;
  ctx.beginPath();
  ctx.lineWidth = gridLineSize;
  // incorporating the grid line in width but not height
  ctx.strokeRect(0, -gridLineSize / 2, cellWidth, cellHeight + gridLineSize);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = penColor;

  const diffFromMaxHeight = cellHeight - cellMeasurements.height;
  ctx.fillText(
    cellMeasurements.header,
    cellWidth / 2,
    cellMeasurements.height +
      diffFromMaxHeight / 2 -
      cellMeasurements.textMetrics.actualBoundingBoxDescent,
  );
  ctx.translate(cellWidth, 0);
  return cellHeight + gridLineSize;
  // at the end should transform
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  padding: number,
  penColors: PenColors,
  orderOfPlay: HeaderCell,
  game: HeaderCell,
  winnersSurname: HeaderCell,
  gridLineSize: number,
  fontFamily: string,
) {
  ctx.save();
  const measurements = [
    measureCell(
      ctx,
      "Order of Play",
      orderOfPlay.header,
      fontFamily,
      orderOfPlay.width,
    ),
    ...["1st", "2nd", "3rd", "4th", "5th"].map((header) =>
      measureCell(ctx, header, game.header, fontFamily, game.width),
    ),
    measureCell(
      ctx,
      "Winners Surname",
      winnersSurname.header,
      fontFamily,
      winnersSurname.width,
    ),
  ];
  const maxHeight = Math.max(...measurements.map((m) => m.height));
  const cellHeight = maxHeight + padding * 2;
  let shift = 0;
  measurements.forEach((m) => {
    shift = drawCell(
      ctx,
      gridLineSize,
      penColors.title,
      penColors.title,
      m,
      cellHeight,
    );
  });
  ctx.restore();
  ctx.translate(0, shift);
}

export interface TableConfig {
  paddingTopBottom: number;
  orderOfPlay: Cell;
  game: Cell;
  winnersSurname: Cell;
  gridLineSize: number;
}
export interface Cell {
  width: number; // will center the text within
  header: FontFormat;
  row: FontFormat;
}

export interface Score {
  home: number;
  away: number;
}

export interface Game {
  orderOfPlay: string;
  scores: Score[];
  winnersSurname: string; // this may need to be a string[] for doubles
}

// assumption is that has already been translated
export function drawTable(
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  config: TableConfig,
  games: Game[],
  fontFamily: string,
) {
  ctx.translate(config.gridLineSize / 2, config.gridLineSize);
  drawHeader(
    ctx,
    config.paddingTopBottom,
    penColors,
    config.orderOfPlay,
    config.game,
    config.winnersSurname,
    config.gridLineSize,
    fontFamily,
  );
  for (let i = 0; i < games.length; i++) {
    drawGameRow(
      games[i],
      ctx,
      config.paddingTopBottom,
      penColors,
      config.orderOfPlay,
      config.game,
      config.winnersSurname,
      config.gridLineSize,
      fontFamily,
      i === 9,
    );
  }
}

function drawGameRow(
  game: Game,
  ctx: CanvasRenderingContext2D,
  padding: number,
  penColors: PenColors,
  orderOfPlay: RowCell,
  gameCell: RowCell,
  winnersSurname: HeaderCell,
  gridLineSize: number,
  fontFamily: string,
  isDoubles: boolean,
) {
  ctx.save();
  const gameScoreMeasurements = game.scores.map((score) => {
    const text = `${score.home} / ${score.away}`;
    return measureCell(ctx, text, gameCell.row, fontFamily, gameCell.width);
  });
  if (game.scores.length < 5) {
    const diff = 5 - game.scores.length;
    for (let i = 0; i < diff; i++) {
      gameScoreMeasurements.push(
        measureCell(ctx, "/", gameCell.row, fontFamily, gameCell.width),
      );
    }
  }
  const measurements = [
    measureCell(
      ctx,
      game.orderOfPlay,
      orderOfPlay.row,
      fontFamily,
      orderOfPlay.width,
      isDoubles,
    ),
    ...gameScoreMeasurements,
    // could end up having different heights based on the surname *********************************
    measureCell(
      ctx,
      game.winnersSurname,
      winnersSurname.header,
      fontFamily,
      winnersSurname.width,
    ),
  ];
  const maxHeight = Math.max(...measurements.map((m) => m.height));
  const cellHeight = maxHeight + padding * 2;
  let shift = 0;
  measurements.forEach((m) => {
    shift = drawCell(
      ctx,
      gridLineSize,
      penColors.title,
      m.isEntry ? penColors.entry : penColors.title,
      m,
      cellHeight,
    );
  });
  ctx.restore();
  ctx.translate(0, shift);
}
