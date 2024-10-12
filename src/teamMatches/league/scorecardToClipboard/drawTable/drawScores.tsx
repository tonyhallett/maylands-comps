import { Score } from ".";

export const drawScores = (
  ctx: CanvasRenderingContext2D,
  gameSeparatorWidth: number,
  gamePointsPadding: number,
  cellWidth: number,
  y: number,
  homeWidth: number,
  score: Score,
  entryColor: string,
) => {
  const homeX =
    cellWidth / 2 - gameSeparatorWidth / 2 - homeWidth - gamePointsPadding;
  ctx.textAlign = "left";
  ctx.fillStyle = entryColor;
  ctx.fillText(score.home.toString(), homeX, y);

  const awayX = cellWidth / 2 + gameSeparatorWidth / 2 + gamePointsPadding;
  ctx.fillText(score.away.toString(), awayX, y);
};
